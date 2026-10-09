import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Empresa, Categoria, Produto, Config, TemaConfig, CartItem, CartItemOpcao, TemaCores, Pedido, LojaStatusEnum } from '../types';
import { NICHOS } from '../data/nichos';
import { TEMAS } from '../data/temas';
import { SAMPLE_DATA, getDefaultConfig } from '../data/sampleData';
import { TIPO_COMIDA_PADRAO } from '../data/adicionaisData';
import { db, getLojas, getLojasMeta, getLoja, saveLoja, createNewLoja, deleteLoja, countLojas, LojaMeta, LojaRecord, LojaSnapshot, LojaDono, PlanoCliente, novoPlano, updateLojaDono } from '../db/db';
import { fetchPublicStore } from '../utils/publish';
import { calcularStatusLoja } from '../utils/lojaStatus';
import { TipoPlano, DIAS_PLANOS } from '../utils/plano';
import { api } from '../services/api';

const LEGACY_LOCAL_STORAGE_KEY = 'catalogo_express_data_v2';

export type ViewValue = 'onboarding' | 'admin' | 'public' | 'storemanager' | 'cadastro' | 'login' | 'pedidos' | 'superadmin-login';

interface CatalogContextType {
  // Estado da loja/tenant ativa
  nichoId: string;
  config: Config;
  empresa: Empresa;
  categorias: Categoria[];
  produtos: Produto[];
  cart: CartItem[];
  activeStep: number;
  activeView: ViewValue;
  isOnboarded: boolean;
  isCustomerView: boolean;
  isLoading: boolean;
  /** Indica que o acesso é de um cliente do sistema (comprador) logado, sem permissões de root. */
  isClienteLogado: boolean;

  // Super Admin & Store Unified Authentication
  isSuperAdminLogado: boolean;
  login: (email: string, senha: string) => Promise<{ ok: boolean; mensagem?: string; role?: 'superroot' | 'loja' }>;
  loginSuperAdmin: (email: string, senha: string) => Promise<{ ok: boolean; mensagem?: string }>;
  logoutSuperAdmin: () => void;
  updateLojaDonoCredentials: (slug: string, dados: Partial<LojaDono>) => Promise<void>;

  // Cadastro / login do cliente/comprador do sistema
  dono: LojaDono | null;
  registrarDono: (dados: Omit<LojaDono, 'nome'> & { nome?: string }, planoTipo?: TipoPlano) => Promise<{ ok: boolean; mensagem?: string }>;
  loginDono: (email: string, senha: string) => Promise<{ ok: boolean; mensagem?: string }>;
  updateDono: (dados: Partial<LojaDono>) => Promise<void>;
  logoutDono: () => void;

  // Plano contratado (rastreio de vencimento no root e confirmação de pagamento)
  plano: PlanoCliente | null;
  renovarPlano: (slug: string, dias?: number) => Promise<void>;
  setPlanoDias: (slug: string, dias: number) => Promise<void>;
  togglePagamentoLoja: (slug: string, pago: boolean) => Promise<void>;
  selecionarPlanoLoja: (slug: string, planoTipo: TipoPlano) => Promise<void>;

  // Multi-tenant (Super Admin)
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
  lojas: LojaMeta[];
  refreshLojas: () => Promise<void>;
  selectLoja: (slug: string) => Promise<void>;
  createLoja: (nome: string, nichoId?: string) => Promise<LojaMeta>;
  renameLoja: (slug: string, novoNome: string) => Promise<void>;
  duplicateLoja: (slug: string, novoNome: string) => Promise<string | null>;
  deleteLoja: (slug: string) => Promise<void>;
  liberarLoja: (slug: string) => Promise<void>;

  // Publicação e Backup geral
  exportEcosystemJson: () => Promise<string>;
  importEcosystemJson: (jsonStr: string) => Promise<boolean>;

  // Actions de navegação e visual
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  setActiveStep: (step: number) => void;
  setActiveView: (view: ViewValue) => void;
  setNicho: (nichoId: string) => void;
  setTema: (tema: TemaConfig) => void;
  customPalettes: TemaConfig[];
  addCustomPalette: (nome?: string, initialCores?: Partial<TemaCores>) => { success: boolean; message?: string; palette?: TemaConfig };
  updateCustomPalette: (id: string, updatedData: Partial<TemaConfig>) => void;
  deleteCustomPalette: (id: string) => void;
  updateCustomColors: (cores: Partial<TemaCores>) => void;
  updateEmpresa: (data: Partial<Empresa>) => void;
  addCategoria: (nome: string, icone?: string) => Categoria;
  updateCategoria: (id: number | string, data: Partial<Categoria>) => void;
  deleteCategoria: (id: number | string) => void;
  addProduto: (produtoData: Omit<Produto, 'id' | 'ordem'>) => Produto;
  updateProduto: (id: number | string, data: Partial<Produto>) => void;
  deleteProduto: (id: number | string) => void;
  reorderProdutos: (newOrder: Produto[]) => void;
  trackCliqueLinkExterno: (produtoId: number | string) => void;
  loadSampleDataForNiche: (nichoId: string) => void;
  finishOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  publicarCatalogo: (slugTarget?: string) => Promise<{ ok: boolean; mensagem?: string }>;

  // Cart
  addToCart: (
    produto: Produto,
    quantidade?: number,
    observacoes?: string,
    opcoesSelecionadas?: Record<string, string>,
    opcoesDetalhe?: CartItemOpcao[]
  ) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;

  // Tipo de comida (gera os adicionais padrão por produto)
  tipoComida: string;
  setTipoComida: (tipo: string) => void;

  // Pedidos (rastreio do dono)
  pedidos: Pedido[];
  registrarPedido: (slug: string, dados: Omit<Pedido, 'id' | 'data' | 'status'>) => void;
  atualizarStatusPedido: (slug: string, pedidoId: string, novoStatus: Pedido['status']) => void;

  // Backup & Reset (loja ativa)
  resetCatalog: () => void;
  importBackupJson: (jsonStr: string) => boolean;
  exportBackupJson: () => string;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

/** Transforma um texto em slug seguro para URL (sem acentos, espaços viram hífen). */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'loja'
  ).slice(0, 60);
}

/** Cria um registro novo para uma loja com categorias apropriadas para seu nicho. */
function defaultRecordFor(nome: string, nichoId: string, slug: string): LojaRecord {
  const sample = SAMPLE_DATA[nichoId] || SAMPLE_DATA.outros || SAMPLE_DATA.restaurante;
  const nichoObj = NICHOS.find((n) => n.id === nichoId);
  const themeId = nichoObj?.temasRecomendados[0] || 'peacock-feather';
  return {
    slug,
    nome,
    nichoId,
    isOnboarded: false,
    publicada: false,
    liberada: true,
    dono: {
      nome: `Admin ${nome}`,
      email: `${slug}@loja.com`,
      senha: '123456',
      telefone: '',
    },
    updatedAt: Date.now(),
    data: {
      empresa: {
        nome,
        telefone: '',
        whatsapp: '',
        endereco: '',
        metaTitle: `${nome} - Catálogo Digital`,
        metaDescription: `Confira nossos produtos e faça seu pedido online!`,
        slug,
      },
      categorias: sample.categorias,
      produtos: [],
      config: getDefaultConfig(nichoId, themeId),
      nichoId,
      isOnboarded: false,
    },
  };
}

/** Cria um registro a partir do snapshot legacy do localStorage (migração). */
function recordFromLegacy(legacy: any): LojaRecord {
  const nichoId = legacy?.nichoId || 'restaurante';
  const empresa = legacy?.empresa || SAMPLE_DATA.restaurante.empresa;
  const slug = empresa?.slug || slugify(empresa?.nome || 'minha-loja');
  return {
    slug,
    nome: empresa?.nome || 'Minha Loja',
    nichoId,
    isOnboarded: legacy?.isOnboarded ?? true,
    publicada: false,
    liberada: false,
    updatedAt: Date.now(),
    data: {
      empresa,
      categorias: legacy?.categorias || SAMPLE_DATA.restaurante.categorias,
      produtos: legacy?.produtos || SAMPLE_DATA.restaurante.produtos,
      config: legacy?.config || getDefaultConfig(nichoId, 'peacock-feather'),
      nichoId,
      isOnboarded: legacy?.isOnboarded ?? true,
    },
  };
}

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nichoId, setNichoIdState] = useState<string>('restaurante');
  const [config, setConfig] = useState<Config>(() => getDefaultConfig('restaurante', 'sunset-view'));
  const [empresa, setEmpresa] = useState<Empresa>(() => SAMPLE_DATA.restaurante.empresa);
  const [categorias, setCategorias] = useState<Categoria[]>(() => SAMPLE_DATA.restaurante.categorias);
  const [produtos, setProdutos] = useState<Produto[]>(() => SAMPLE_DATA.restaurante.produtos);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeView, setActiveViewState] = useState<ViewValue>('login');
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isCustomerView, setIsCustomerView] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [lojas, setLojas] = useState<LojaMeta[]>([]);
  const [dono, setDono] = useState<LojaDono | null>(null);
  const [plano, setPlanoState] = useState<PlanoCliente | null>(null);
  const [isClienteLogado, setIsClienteLogado] = useState<boolean>(false);
  const [isSuperAdminLogado, setIsSuperAdminLogado] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('catalogo_superroot_auth') === 'true';
  });

  const refreshLojas = useCallback(async () => {
    if (isClienteLogado) {
      // Isolamento: o comprador nunca recebe a lista de todas as lojas.
      if (!activeSlug) {
        setLojas([]);
        return;
      }
      const rec = await getLoja(activeSlug);
      if (!rec) {
        setLojas([]);
        return;
      }
      const s = calcularStatusLoja(rec);
      setLojas([
        {
          slug: rec.slug,
          nome: rec.nome,
          nichoId: rec.nichoId,
          isOnboarded: rec.isOnboarded,
          publicada: s.isPublicada,
          status: s.status,
          liberada: rec.liberada,
          donoNome: rec.dono?.nome,
          dono: rec.dono,
          plano: rec.plano,
          updatedAt: rec.updatedAt,
          produtosCount: s.totalProdutos,
          temLoginSenha: s.temLoginSenha,
          temPerfilConfigurado: s.temPerfilConfigurado,
          motivoIncompleto: s.motivoIncompleto,
        },
      ]);
      return;
    }
    const metas = await getLojasMeta();
    setLojas(metas);
  }, [activeSlug, isClienteLogado]);

  /** Preenche o estado atual com os dados de um registro de loja (modo edição). */
  const applyLoja = useCallback((rec: LojaRecord) => {
    setActiveSlug(rec.slug);
    setNichoIdState(rec.nichoId);
    setConfig(rec.data.config);
    setEmpresa(rec.data.empresa);
    setCategorias(rec.data.categorias);
    setProdutos(rec.data.produtos);
    setIsOnboarded(rec.data.isOnboarded);
    setDono(rec.dono ?? null);
    setPlanoState(rec.plano ?? null);
    setPedidos(rec.data.pedidos ?? []);
    setCart([]);
  }, []);

  // Inicialização assíncrona: migração legacy + rota por slug (?loja=...)
  useEffect(() => {
    let mounted = true;

    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const slugParam = (urlParams.get('loja') || '').trim();
      const acessoParam = (urlParams.get('acesso') || '').trim();
      const hash = window.location.hash || '';
      const isPublicUrl =
        !!slugParam ||
        urlParams.get('view') === 'public' ||
        urlParams.get('mode') === 'public' ||
        hash.includes('loja') ||
        hash.includes('public');
      // Rota própria do Super Admin (root): #/admin
      const isRootUrl = hash === '#/admin' || hash.startsWith('#/admin/');

      // 1. Semeia a primeira loja (migração do localStorage legacy / dados de exemplo)
      const hasAny = (await countLojas()) > 0;
      if (!hasAny) {
        let seed: LojaRecord;
        try {
          const legacyRaw = localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
          if (legacyRaw) {
            seed = recordFromLegacy(JSON.parse(legacyRaw));
          } else {
            seed = {
              slug: 'minha-loja',
              nome: SAMPLE_DATA.restaurante.empresa.nome,
              nichoId: 'restaurante',
              isOnboarded: false,
              publicada: false,
              liberada: false,
              updatedAt: Date.now(),
              data: {
                empresa: SAMPLE_DATA.restaurante.empresa,
                categorias: SAMPLE_DATA.restaurante.categorias,
                produtos: SAMPLE_DATA.restaurante.produtos,
                config: getDefaultConfig('restaurante', 'sunset-view'),
                nichoId: 'restaurante',
                isOnboarded: false,
              },
            };
          }
        } catch {
          seed = defaultRecordFor('Minha Loja', 'restaurante', 'minha-loja');
        }
        await saveLoja(seed);
      }

      const criarLojaParam = (urlParams.get('criar') || '').trim();
      const cadastroParam = (urlParams.get('cadastro') || '').trim();

      // 2. Link direto para criação de nova loja/cliente (?criar=loja ou ?cadastro=true avulso)
      if (criarLojaParam === 'loja' || (cadastroParam === 'true' && !slugParam && !acessoParam)) {
        if (mounted) {
          setIsCustomerView(false);
          setIsClienteLogado(false);
          setActiveViewState('cadastro');
          setTimeout(() => setIsLoading(false), 200);
        }
        return;
      }

      // 3. Modo por slug (?loja=... ou ?acesso=...)
      if (slugParam || acessoParam) {
        const targetSlug = (acessoParam === 'dono' ? slugParam : acessoParam) || slugParam || '';
        setIsCustomerView(false);
        setIsClienteLogado(false);

        let rec = await getLoja(targetSlug);
        if (!rec) {
          const cloud = await fetchPublicStore(targetSlug);
          if (cloud) {
            rec = {
              slug: targetSlug,
              nome: cloud.empresa?.nome || targetSlug,
              nichoId: cloud.nichoId || 'restaurante',
              isOnboarded: true,
              publicada: true,
              liberada: true,
              updatedAt: Date.now(),
              data: {
                empresa: cloud.empresa,
                categorias: cloud.categorias || [],
                produtos: cloud.produtos || [],
                config: cloud.config,
                nichoId: cloud.nichoId || 'restaurante',
                isOnboarded: true,
              },
            };
          } else {
            rec = defaultRecordFor(targetSlug || 'Minha Loja', 'restaurante', targetSlug);
          }
          await saveLoja(rec);
        }

        if (mounted) {
          applyLoja(rec);
          const hasCredentials = Boolean(rec.dono?.email && rec.dono?.senha);

          if (isPublicUrl && !acessoParam && (urlParams.get('view') === 'public' || urlParams.get('mode') === 'public')) {
            setIsCustomerView(true);
            setActiveViewState('public');
          } else if (cadastroParam === 'true' || !hasCredentials) {
            // Se cadastro=true ou loja não configurada: abre na tela de cadastro
            setActiveViewState('cadastro');
          } else {
            // Loja já configurada (com login e senha): abre na tela de login para o usuário se logar
            setActiveViewState('login');
          }
        }
      } else if (mounted) {
        // Acesso padrão (ao abrir o projeto): verifica sessão existente ou abre na tela de login única
        const sessionType = sessionStorage.getItem('catalogo_session_type');
        const sessionSlug = sessionStorage.getItem('catalogo_session_slug');

        if (sessionType === 'superroot' && sessionStorage.getItem('catalogo_superroot_auth') === 'true') {
          setIsSuperAdminLogado(true);
          const metas = await getLojasMeta();
          setLojas(metas);
          setActiveSlug(metas[0]?.slug || null);
          setActiveViewState('storemanager');
        } else if (sessionType === 'cliente' && sessionSlug) {
          const rec = await getLoja(sessionSlug);
          if (rec) {
            applyLoja(rec);
            setIsClienteLogado(true);
            setActiveViewState(rec.data.isOnboarded ? 'admin' : 'onboarding');
          } else {
            setActiveViewState('login');
          }
        } else {
          setActiveViewState('login');
        }
      }

      if (mounted) setTimeout(() => setIsLoading(false), 600);
    })().catch(() => {
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveView = useCallback((view: ViewValue) => {
    setActiveViewState(view);
  }, []);

  // Auto-save: persiste a loja ativa no IndexedDB (Dexie) com debounce de 250ms
  useEffect(() => {
    if (!activeSlug || isCustomerView) return;
    // No Super Admin (root) não há loja "em edição": estados podem conter dados
    // default e sobrescreveriam a loja — então não salvamos nesse modo.
    if (activeView === 'storemanager') return;

    const timer = setTimeout(() => {
      const meta = lojas.find((l) => l.slug === activeSlug);
      const snap: LojaSnapshot = { empresa, categorias, produtos, config, nichoId, isOnboarded, pedidos };
      const s = calcularStatusLoja({
        slug: activeSlug,
        nome: meta?.nome || empresa.nome || 'Minha Loja',
        isOnboarded,
        dono: dono ?? undefined,
        data: snap,
      });

      saveLoja({
        slug: activeSlug,
        nome: meta?.nome || empresa.nome || 'Minha Loja',
        nichoId,
        isOnboarded,
        publicada: s.isPublicada,
        liberada: meta?.liberada ?? false,
        dono: dono ?? undefined,
        plano: plano ?? meta?.plano,
        updatedAt: Date.now(),
        data: snap,
      }).then(refreshLojas);
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug, isCustomerView, activeView, empresa, categorias, produtos, config, nichoId, isOnboarded, dono, plano, pedidos]);

  const setNicho = (newNichoId: string) => {
    setNichoIdState(newNichoId);
    const nichoObj = NICHOS.find((n) => n.id === newNichoId);
    const recommendedThemeId = nichoObj?.temasRecomendados[0] || 'peacock-feather';
    setConfig(getDefaultConfig(newNichoId, recommendedThemeId));

    if (SAMPLE_DATA[newNichoId]) {
      setEmpresa(SAMPLE_DATA[newNichoId].empresa);
      setCategorias(SAMPLE_DATA[newNichoId].categorias);
      setProdutos(SAMPLE_DATA[newNichoId].produtos);
    } else {
      setEmpresa({ nome: 'Minha Loja', telefone: '', whatsapp: '' });
      setCategorias([{ id: 1, nome: 'Geral', ordem: 1, icone: '📦' }]);
      setProdutos([]);
    }
    setActiveStep(1);
  };

  const customPalettes = config.customPalettes || [];
  const tipoComida = config.tipoComida || TIPO_COMIDA_PADRAO;

  const setTipoComida = (tipo: string) => {
    setConfig((prev) => ({ ...prev, tipoComida: tipo }));
  };

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('catalogo_dark_mode');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  const setDarkMode = useCallback((dark: boolean) => {
    setIsDarkModeState(dark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('catalogo_dark_mode', String(dark));
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    setConfig((prev) => {
      let nextTema = prev.tema;
      if (!dark && prev.tema.id.includes('dark')) {
        // Se desativou o modo escuro mas estava com tema dark selecionado, volta pro tema claro padrão
        const lightTema = TEMAS.find((t) => !t.id.includes('dark')) || TEMAS[0];
        nextTema = lightTema;
      }
      return {
        ...prev,
        tema: nextTema,
        customizacao: {
          ...prev.customizacao,
          darkMode: dark,
        },
      };
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkModeState((prevDark) => {
      const nextDark = !prevDark;
      if (typeof window !== 'undefined') {
        localStorage.setItem('catalogo_dark_mode', String(nextDark));
        if (nextDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      setConfig((prev) => {
        let nextTema = prev.tema;
        if (!nextDark && prev.tema.id.includes('dark')) {
          const lightTema = TEMAS.find((t) => !t.id.includes('dark')) || TEMAS[0];
          nextTema = lightTema;
        }
        return {
          ...prev,
          tema: nextTema,
          customizacao: {
            ...prev.customizacao,
            darkMode: nextDark,
          },
        };
      });
      return nextDark;
    });
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const setTema = (tema: TemaConfig) => {
    const isDarkTheme = tema.id.includes('dark') || (tema.cores.background && tema.cores.background.startsWith('#0'));
    const nextDark = isDarkTheme ? true : false;
    setIsDarkModeState(nextDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('catalogo_dark_mode', String(nextDark));
      if (nextDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    setConfig((prev) => ({
      ...prev,
      tema,
      customizacao: {
        ...prev.customizacao,
        corPrimaria: tema.cores.primary,
        corSecundaria: tema.cores.secondary,
        darkMode: nextDark,
      },
    }));
  };

  const addCustomPalette = (nome?: string, initialCores?: Partial<TemaCores>) => {
    const currentList = config.customPalettes || [];
    if (currentList.length >= 4) {
      return {
        success: false,
        message: 'Limite máximo de 4 paletas personalizadas atingido. Selecione uma paleta existente que você criou para alterá-la.',
      };
    }
    const newId = `custom-paletta-${Date.now()}`;
    const newPalette: TemaConfig = {
      id: newId,
      nome: nome || `Paleta Personalizada ${currentList.length + 1}`,
      descricao: 'Paleta exclusiva personalizada pelo usuário',
      icone: '🎨',
      cores: {
        primary: initialCores?.primary || '#F59E0B',
        secondary: initialCores?.secondary || '#3B82F6',
        tertiary: initialCores?.tertiary || '#10B981',
        background: initialCores?.background || '#F8F9FA',
        surface: initialCores?.surface || '#FFFFFF',
        text: initialCores?.text || '#1A1A1A',
        textSecondary: initialCores?.textSecondary || '#64748B',
        border: initialCores?.border || '#E2E8F0',
        accent: initialCores?.accent || '#CBD5E1',
      },
    };
    const updatedPalettes = [...currentList, newPalette];
    setConfig((prev) => ({
      ...prev,
      customPalettes: updatedPalettes,
      tema: newPalette,
      customizacao: {
        ...prev.customizacao,
        corPrimaria: newPalette.cores.primary,
        corSecundaria: newPalette.cores.secondary,
      },
    }));
    return { success: true, palette: newPalette };
  };

  const updateCustomPalette = (id: string, updatedData: Partial<TemaConfig>) => {
    setConfig((prev) => {
      const list = prev.customPalettes || [];
      const newList = list.map((p) =>
        p.id === id ? { ...p, ...updatedData, cores: updatedData.cores ? { ...p.cores, ...updatedData.cores } : p.cores } : p
      );
      const isCurrent = prev.tema.id === id;
      const updatedTheme = isCurrent
        ? { ...prev.tema, ...updatedData, cores: updatedData.cores ? { ...prev.tema.cores, ...updatedData.cores } : prev.tema.cores }
        : prev.tema;
      return {
        ...prev,
        customPalettes: newList,
        tema: updatedTheme,
        customizacao: { ...prev.customizacao, corPrimaria: updatedTheme.cores.primary, corSecundaria: updatedTheme.cores.secondary },
      };
    });
  };

  const deleteCustomPalette = (id: string) => {
    setConfig((prev) => {
      const list = prev.customPalettes || [];
      const newList = list.filter((p) => p.id !== id);
      const wasActive = prev.tema.id === id;
      return { ...prev, customPalettes: newList, tema: wasActive ? TEMAS[0] : prev.tema };
    });
  };

  const updateCustomColors = (cores: Partial<TemaCores>) => {
    setConfig((prev) => {
      const updatedCores = { ...prev.tema.cores, ...cores };
      const activeThemeId = prev.tema.id;
      const list = (prev.customPalettes || []).map((p) => (p.id === activeThemeId ? { ...p, cores: updatedCores } : p));
      return {
        ...prev,
        customPalettes: list,
        tema: { ...prev.tema, cores: updatedCores },
        customizacao: { ...prev.customizacao, corPrimaria: updatedCores.primary, corSecundaria: updatedCores.secondary },
      };
    });
  };

  const updateEmpresa = (data: Partial<Empresa>) => {
    setEmpresa((prev) => ({ ...prev, ...data }));
  };

  const addCategoria = (nome: string, icone: string = '📂'): Categoria => {
    const newId = Date.now();
    const newCat: Categoria = { id: newId, nome, ordem: categorias.length + 1, icone };
    setCategorias((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategoria = (id: number | string, data: Partial<Categoria>) => {
    setCategorias((prev) => prev.map((c) => (c.id == id ? { ...c, ...data } : c)));
  };

  const deleteCategoria = (id: number | string) => {
    setCategorias((prev) => prev.filter((c) => c.id != id));
    setProdutos((prev) => prev.filter((p) => p.categoria != id));
  };

  const addProduto = (produtoData: Omit<Produto, 'id' | 'ordem'>): Produto => {
    const newId = Date.now();
    const newProd: Produto = {
      id: newId,
      nome: produtoData.nome,
      descricao: produtoData.descricao || '',
      categoria: produtoData.categoria,
      preco: produtoData.preco,
      status: produtoData.status ?? true,
      destaque: produtoData.destaque ?? false,
      ordem: produtos.length + 1,
      imagem: produtoData.imagem,
      thumbnail: produtoData.thumbnail,
      opcoes: produtoData.opcoes,
    };
    setProdutos((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduto = (id: number | string, data: Partial<Produto>) => {
    setProdutos((prev) => prev.map((p) => (p.id == id ? { ...p, ...data } : p)));
  };

  const deleteProduto = (id: number | string) => {
    setProdutos((prev) => prev.filter((p) => p.id != id));
  };

  const reorderProdutos = (newOrder: Produto[]) => setProdutos(newOrder);

  const trackCliqueLinkExterno = (produtoId: number | string) => {
    setProdutos((prev) =>
      prev.map((p) =>
        p.id == produtoId
          ? { ...p, cliquesExternos: (Number(p.cliquesExternos) || 0) + 1 }
          : p
      )
    );
  };

  const loadSampleDataForNiche = (targetNichoId: string) => {
    const sample = SAMPLE_DATA[targetNichoId] || SAMPLE_DATA.restaurante;
    setNichoIdState(targetNichoId);
    setConfig(getDefaultConfig(targetNichoId, 'peacock-feather'));
    setEmpresa(sample.empresa);
    setCategorias(sample.categorias);
    setProdutos(sample.produtos);
  };

  const publicarCatalogo = async (slugTarget?: string): Promise<{ ok: boolean; mensagem?: string }> => {
    const slug = slugTarget || activeSlug || empresa.slug || slugify(empresa.nome || 'minha-loja');
    if (!slug) return { ok: false, mensagem: 'Slug da loja não identificado.' };

    setIsLoading(true);
    try {
      const snap: LojaSnapshot = {
        empresa: { ...empresa, slug },
        categorias,
        produtos,
        config,
        nichoId,
        isOnboarded: true,
        pedidos,
      };

      if (!activeSlug) {
        setActiveSlug(slug);
      }
      sessionStorage.setItem('catalogo_session_slug', slug);

      // 1. Envia requisição HTTP ao endpoint PUT /api/stores/:slug no backend PostgreSQL
      try {
        await api.stores.update(slug, {
          name: empresa.nome || 'Minha Loja',
          whatsapp: empresa.whatsapp || empresa.telefone || dono?.telefone || '',
          status: 'publicada',
          config: {
            nichoId,
            isOnboarded: true,
            liberada: true,
            dono: dono ?? undefined,
            plano: plano ?? undefined,
            data: snap,
          },
        });
      } catch {
        // Se ainda não existir na tabela stores, cria via POST /api/stores
        await api.stores.create({
          name: empresa.nome || 'Minha Loja',
          slug,
          whatsapp: empresa.whatsapp || empresa.telefone || dono?.telefone || '',
          status: 'publicada',
          config: {
            nichoId,
            isOnboarded: true,
            liberada: true,
            dono: dono ?? undefined,
            plano: plano ?? undefined,
            data: snap,
          },
        });
      }

      // 2. Atualiza estado local e cache
      await saveLoja({
        slug,
        nome: empresa.nome || 'Minha Loja',
        nichoId,
        isOnboarded: true,
        publicada: true,
        liberada: true,
        dono: dono ?? undefined,
        plano: plano ?? undefined,
        updatedAt: Date.now(),
        data: snap,
      });

      setIsOnboarded(true);
      await refreshLojas();
      return { ok: true };
    } catch (err: any) {
      console.error('Erro ao acionar endpoint de publicação:', err);
      return { ok: false, mensagem: err.message || 'Erro ao publicar no servidor.' };
    } finally {
      setIsLoading(false);
    }
  };

  const finishOnboarding = async () => {
    const res = await publicarCatalogo();
    if (!res.ok) {
      console.warn('Aviso na publicação:', res.mensagem);
    }
    setActiveViewState('admin');
  };

  // Cart
  const addToCart = (
    produto: Produto,
    quantidade: number = 1,
    observacoes?: string,
    opcoesSelecionadas?: Record<string, string>,
    opcoesDetalhe?: CartItemOpcao[]
  ) => {
    const itemId = `${produto.id}-${JSON.stringify(opcoesDetalhe || opcoesSelecionadas || {})}`;
    const acrescimo = (opcoesDetalhe || []).reduce(
      (acc, g) => acc + g.itens.reduce((a, i) => a + (Number(i.preco) || 0), 0),
      0
    );
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing)
        return prev.map((i) => (i.id === itemId ? { ...i, quantidade: i.quantidade + quantidade } : i));
      return [
        ...prev,
        {
          id: itemId,
          produto,
          quantidade,
          observacoes,
          opcoesSelecionadas,
          opcoesDetalhe,
          acrescimo,
        },
      ];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? (item.quantidade + delta > 0 ? { ...item, quantidade: item.quantidade + delta } : null) : item
        )
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => setCart((prev) => prev.filter((i) => i.id !== itemId));
  const clearCart = () => setCart([]);

  // ---- Pedidos (rastreio do dono) ----
  const registrarPedido = useCallback(
    async (slug: string, dados: Omit<Pedido, 'id' | 'data' | 'status'>) => {
      const targetSlug = slug || activeSlug;
      if (!targetSlug) return;
      const novo: Pedido = {
        id: `ped-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        data: Date.now(),
        ...dados,
        status: 'novo',
      };
      setPedidos((prev) => [novo, ...prev]);

      // Garante gravação segura no Dexie (IndexedDB)
      try {
        const rec = await getLoja(targetSlug);
        if (rec) {
          const listaAtual = rec.data.pedidos || [];
          rec.data.pedidos = [novo, ...listaAtual];
          await saveLoja(rec);
        }
      } catch (err) {
        console.warn('Erro ao persistir pedido:', err);
      }
    },
    [activeSlug]
  );

  const atualizarStatusPedido = useCallback(
    async (slug: string, pedidoId: string, novoStatus: Pedido['status']) => {
      const targetSlug = slug || activeSlug;
      if (!targetSlug) return;
      setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p)));

      try {
        const rec = await getLoja(targetSlug);
        if (rec && rec.data.pedidos) {
          rec.data.pedidos = rec.data.pedidos.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p));
          await saveLoja(rec);
        }
      } catch (err) {
        console.warn('Erro ao atualizar status do pedido:', err);
      }
    },
    [activeSlug]
  );

  // ---- Multi-tenancy (Super Admin) ----

  const selectLoja = async (slug: string) => {
    if (isClienteLogado) return; // exclusivo do root
    const rec = await getLoja(slug);
    if (!rec) return;
    setIsCustomerView(false);
    applyLoja(rec);
    setActiveStep(0);
    setActiveViewState('admin');
    await refreshLojas();
  };

  const createLoja = async (nome: string, nichoIdOpt?: string): Promise<LojaMeta> => {
    if (isClienteLogado) {
      return { slug: '', nome: '', nichoId: '', isOnboarded: false, publicada: false, liberada: false, updatedAt: 0, status: LojaStatusEnum.RASCUNHO };
    }
    const nicho = nichoIdOpt || 'restaurante';
    const baseSlug = slugify(nome) || `loja-${Date.now()}`;
    let slug = baseSlug;
    let contador = 1;
    while (await getLoja(slug)) {
      slug = `${baseSlug}-${contador++}`;
    }
    const rec = defaultRecordFor(nome.trim() || 'Minha Loja', nicho, slug);
    await createNewLoja(rec);
    await refreshLojas();

    const s = calcularStatusLoja(rec);
    // Root permanece no Super Admin; só destaca a loja criada (para copiar o link de acesso).
    return {
      slug,
      nome: rec.nome,
      nichoId: nicho,
      isOnboarded: false,
      publicada: s.isPublicada,
      status: s.status,
      liberada: true,
      dono: rec.dono,
      donoNome: rec.dono?.nome,
      updatedAt: rec.updatedAt,
      produtosCount: s.totalProdutos,
      temLoginSenha: s.temLoginSenha,
      temPerfilConfigurado: s.temPerfilConfigurado,
      motivoIncompleto: s.motivoIncompleto,
    };
  };

  const renameLoja = async (slug: string, novoNome: string) => {
    if (isClienteLogado) return;
    const rec = await getLoja(slug);
    if (!rec || !novoNome.trim()) return;
    rec.nome = novoNome.trim();
    rec.data.empresa = { ...rec.data.empresa, nome: novoNome.trim() };
    await saveLoja(rec);
    if (activeSlug === slug) setEmpresa((prev) => ({ ...prev, nome: novoNome.trim() }));
    await refreshLojas();
  };

  const duplicateLoja = async (slug: string, novoNome: string): Promise<string | null> => {
    if (isClienteLogado) return null;
    const rec = await getLoja(slug);
    if (!rec) return null;
    const name = novoNome.trim() || `${rec.nome} (cópia)`;
    const base = slugify(name) || `${rec.slug}-copia`;
    let novoSlug = base;
    let contador = 1;
    while (await getLoja(novoSlug)) novoSlug = `${base}-${contador++}`;
    const clone: LojaRecord = {
      ...rec,
      slug: novoSlug,
      nome: name,
      publicada: false,
      liberada: false,
      updatedAt: Date.now(),
      data: JSON.parse(JSON.stringify(rec.data)) as LojaSnapshot,
    };
    await saveLoja(clone);
    await refreshLojas();
    return novoSlug;
  };

  const liberarLoja = async (slug: string) => {
    if (isClienteLogado) return;
    const rec = await getLoja(slug);
    if (!rec) return;
    rec.liberada = true;
    await saveLoja(rec);
    await refreshLojas();
  };

  // Renova o plano: reinicia a contagem a partir de hoje com o período indicado.
  const renovarPlano = async (slug: string, dias: number = 30) => {
    if (isClienteLogado) return;
    const rec = await getLoja(slug);
    if (!rec) return;
    const atual = rec.plano ?? novoPlano(dias);
    rec.plano = {
      inicio: Date.now(),
      dias: dias > 0 ? dias : atual.dias,
      renovacoes: (atual.renovacoes || 0) + 1,
      ultimaRenovacao: Date.now(),
    };
    await saveLoja(rec);
    if (activeSlug === slug) setPlanoState(rec.plano);
    await refreshLojas();
  };

  // Ajusta o período do plano (vencimento) sem reiniciar a contagem.
  const setPlanoDias = async (slug: string, dias: number) => {
    if (isClienteLogado) return;
    const rec = await getLoja(slug);
    if (!rec) return;
    if (!rec.plano) rec.plano = novoPlano(dias);
    else rec.plano.dias = dias > 0 ? dias : 30;
    await saveLoja(rec);
    if (activeSlug === slug) setPlanoState(rec.plano);
    await refreshLojas();
  };

  // Alterna a confirmação de pagamento do plano (toggle pelo Superoot via API oficial)
  const togglePagamentoLoja = async (slug: string, pago: boolean) => {
    if (isClienteLogado) return;
    const rec = await getLoja(slug);
    if (!rec) return;

    try {
      // Aciona o endpoint oficial no backend com cálculo autoritativo
      const result = await api.stores.togglePayment(slug, pago);
      if (result && result.subscription) {
        const sub = result.subscription;
        rec.plano = {
          tipo: sub.planType as any,
          dias: sub.planDays,
          pago: sub.isPaid,
          dataPagamento: sub.isPaid && result.store?.paidAt ? new Date(result.store.paidAt).getTime() : undefined,
          inicio: sub.isPaid && result.store?.paidAt ? new Date(result.store.paidAt).getTime() : Date.now(),
          renovacoes: rec.plano?.renovacoes || 0,
        };
      }
    } catch (err: any) {
      console.warn('Aviso ao chamar API de pagamento, aplicando fallback local:', err.message);
      const planoAtual = rec.plano || {
        tipo: 'mensal',
        inicio: Date.now(),
        dias: 30,
        pago: false,
        renovacoes: 0,
      };
      const dias = planoAtual.dias || (planoAtual.tipo ? DIAS_PLANOS[planoAtual.tipo] : 30);
      rec.plano = {
        ...planoAtual,
        dias,
        pago,
        dataPagamento: pago ? Date.now() : undefined,
        inicio: pago ? Date.now() : (planoAtual.inicio || Date.now()),
      };
    }

    await saveLoja(rec);
    if (activeSlug === slug) setPlanoState(rec.plano);
    await refreshLojas();
  };

  // Seleciona ou altera o plano contratado da loja via API oficial
  const selecionarPlanoLoja = async (slug: string, tipo: TipoPlano) => {
    const rec = await getLoja(slug);
    if (!rec) return;

    try {
      // Aciona o endpoint oficial no backend
      const result = await api.stores.selectPlan(slug, tipo);
      if (result && result.subscription) {
        const sub = result.subscription;
        rec.plano = {
          tipo: sub.planType as any,
          dias: sub.planDays,
          pago: sub.isPaid,
          dataPagamento: sub.isPaid && result.store?.paidAt ? new Date(result.store.paidAt).getTime() : undefined,
          inicio: rec.plano?.inicio || Date.now(),
          renovacoes: rec.plano?.renovacoes || 0,
        };
      }
    } catch (err: any) {
      console.warn('Aviso ao chamar API de plano, aplicando fallback local:', err.message);
      const dias = DIAS_PLANOS[tipo] || 30;
      const planoAtual = rec.plano;
      rec.plano = {
        tipo,
        dias,
        inicio: planoAtual?.pago ? (planoAtual.inicio || Date.now()) : 0,
        pago: planoAtual?.pago || false,
        dataPagamento: planoAtual?.dataPagamento,
        renovacoes: planoAtual?.renovacoes || 0,
      };
    }

    await saveLoja(rec);
    if (activeSlug === slug) setPlanoState(rec.plano);
    await refreshLojas();
  };

  // ---- Cadastro / login do comprador do sistema com Backend JWT & Bcrypt ----

  const registrarDono = async (
    dados: Omit<LojaDono, 'nome'> & { nome?: string },
    planoTipo: TipoPlano = 'mensal'
  ): Promise<{ ok: boolean; mensagem?: string }> => {
    const nome = dados.nome?.trim() || '';
    const email = dados.email?.trim() || '';
    const telefone = dados.telefone?.trim() || '';
    const senha = dados.senha || '';
    if (!nome) return { ok: false, mensagem: 'Informe seu nome.' };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, mensagem: 'Informe um e-mail válido.' };
    if (!telefone) return { ok: false, mensagem: 'Informe seu telefone.' };
    if (senha.length < 6) return { ok: false, mensagem: 'Crie uma senha com ao menos 6 caracteres.' };

    try {
      // 1. Cadastra o usuário no Backend PostgreSQL (com senha criptografada via Bcrypt)
      const regData = await api.auth.register({
        name: nome,
        email,
        password: senha,
      });

      // 2. Autentica e armazena o token JWT
      const authData = await api.auth.login(email, senha);

      // Se for o primeiro usuário da plataforma, o backend o definiu como superadmin
      if (authData.user?.role === 'superadmin' || regData?.role === 'superadmin') {
        setIsSuperAdminLogado(true);
        setIsClienteLogado(false);
        sessionStorage.setItem('catalogo_session_type', 'superroot');
        sessionStorage.setItem('catalogo_superroot_auth', 'true');
        const metas = await getLojasMeta();
        setLojas(metas);
        setActiveSlug(metas[0]?.slug || null);
        setActiveViewState('storemanager');
        await refreshLojas();
        return { ok: true };
      }
    } catch (err: any) {
      console.warn('Registro na API retornou aviso:', err.message);
    }

    const novoDono: LojaDono = { nome, email, telefone };
    setDono(novoDono);
    setIsClienteLogado(true);
    setIsSuperAdminLogado(false);

    if (activeSlug) {
      sessionStorage.setItem('catalogo_session_type', 'cliente');
      sessionStorage.setItem('catalogo_session_slug', activeSlug);
    }

    // Sempre espelha o whatsapp/contato da empresa com os dados do dono
    setEmpresa((prev) => ({ ...prev, whatsapp: telefone, telefone, email }));

    const diasContratados = DIAS_PLANOS[planoTipo] || 30;
    const novoPlanoCliente: PlanoCliente = {
      tipo: planoTipo,
      dias: diasContratados,
      inicio: 0,
      pago: false, // Inicia pendente de pagamento para confirmação pelo Superoot
      renovacoes: 0,
    };

    // Persiste no banco de dados e atualiza o estado
    const rec = await getLoja(activeSlug || '');
    if (rec) {
      rec.dono = novoDono;
      rec.data.empresa = {
        ...rec.data.empresa,
        whatsapp: telefone,
        telefone,
        email,
      };
      rec.plano = novoPlanoCliente;
      setPlanoState(novoPlanoCliente);
      await saveLoja(rec);

      try {
        await api.stores.update(rec.slug, {
          whatsapp: telefone,
          config: {
            ...rec.data.config,
            plano: novoPlanoCliente,
          },
        });
      } catch (err: any) {
        console.warn('Aviso ao sincronizar dono e plano no backend:', err.message);
      }
    } else {
      setPlanoState(novoPlanoCliente);
    }

    setActiveViewState(rec?.data.isOnboarded || isOnboarded ? 'admin' : 'onboarding');
    setActiveStep(1);
    await refreshLojas();
    return { ok: true };
  };

  const login = async (
    email: string,
    senha: string
  ): Promise<{ ok: boolean; mensagem?: string; role?: 'superroot' | 'loja' }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanSenha = senha.trim();

    if (!normalizedEmail || !cleanSenha) {
      return { ok: false, mensagem: 'Preencha o e-mail e a senha.' };
    }

    try {
      // 1. Autenticação Real via Backend JWT
      const authData = await api.auth.login(normalizedEmail, cleanSenha);
      const user = authData.user;

      // PERFIL 1: Administrador do Sistema (Superroot)
      if (user.role === 'superadmin') {
        setIsSuperAdminLogado(true);
        setIsClienteLogado(false);
        sessionStorage.setItem('catalogo_session_type', 'superroot');
        sessionStorage.setItem('catalogo_superroot_auth', 'true');
        const metas = await getLojasMeta();
        setLojas(metas);
        setActiveSlug(metas[0]?.slug || null);
        setActiveViewState('storemanager');
        return { ok: true, role: 'superroot' };
      }

      // PERFIL 2: Usuário da Plataforma (Lojista para configurar a loja)
      setIsClienteLogado(true);
      setIsSuperAdminLogado(false);
      sessionStorage.setItem('catalogo_session_type', 'cliente');

      const allStores = await getLojas();
      let targetStore = allStores.find((s) => s.slug === activeSlug || s.dono?.email === normalizedEmail);

      // Se não encontrou no cache local, tenta buscar do backend
      if (!targetStore) {
        try {
          const remoteStores = await api.stores.list();
          const foundRemote = remoteStores.find((s) => s.config?.dono?.email === normalizedEmail || s.slug === activeSlug);
          if (foundRemote) {
            targetStore = {
              slug: foundRemote.slug,
              nome: foundRemote.name,
              nichoId: foundRemote.config?.nichoId || 'restaurante',
              isOnboarded: foundRemote.config?.isOnboarded ?? true,
              publicada: foundRemote.status === 'publicada',
              liberada: true,
              dono: foundRemote.config?.dono || { nome: user.name, email: user.email, telefone: foundRemote.whatsapp },
              data: foundRemote.config?.data || defaultRecordFor(foundRemote.name, 'restaurante', foundRemote.slug).data,
              updatedAt: Date.now(),
            };
            await saveLoja(targetStore);
          }
        } catch {
          // segue
        }
      }

      if (targetStore) {
        applyLoja(targetStore);
        sessionStorage.setItem('catalogo_session_slug', targetStore.slug);
        setActiveViewState(targetStore.data.isOnboarded ? 'admin' : 'onboarding');
      } else {
        // Usuário da plataforma novo: inicializa loja e direciona para onboarding para configurá-la
        const baseName = user.name ? `Loja ${user.name}` : 'Minha Loja';
        const newSlug = slugify(user.name ? `loja-${user.name}` : `loja-${Date.now()}`);
        const newRecord = defaultRecordFor(baseName, 'restaurante', newSlug);
        newRecord.dono = { nome: user.name, email: user.email, telefone: '' };
        await saveLoja(newRecord);
        applyLoja(newRecord);
        sessionStorage.setItem('catalogo_session_slug', newRecord.slug);
        setActiveViewState('onboarding');
      }

      setActiveStep(1);
      return { ok: true, role: 'loja' };
    } catch (err: any) {
      return {
        ok: false,
        mensagem: err.message || 'E-mail ou senha incorretos. Verifique suas credenciais no banco de dados.',
      };
    }
  };

  const loginDono = async (email: string, senha: string): Promise<{ ok: boolean; mensagem?: string }> => {
    return login(email, senha);
  };

  const loginSuperAdmin = async (email: string, senha: string): Promise<{ ok: boolean; mensagem?: string }> => {
    return login(email, senha);
  };

  const updateDono = async (dados: Partial<LojaDono>) => {
    if (!activeSlug) return;
    const atual = dono || (await getLoja(activeSlug))?.dono;
    const proximo: LojaDono = {
      nome: dados.nome?.trim() || atual?.nome || '',
      email: dados.email?.trim() || atual?.email || '',
      telefone: dados.telefone?.trim() || atual?.telefone || '',
    };
    setDono(proximo);
    setEmpresa((prev) => ({ ...prev, whatsapp: proximo.telefone, telefone: proximo.telefone, email: proximo.email }));
    const rec = await getLoja(activeSlug);
    if (rec) {
      rec.dono = proximo;
      await saveLoja(rec);
    }
    await refreshLojas();
  };

  const logoutDono = () => {
    api.auth.logout();
    setIsClienteLogado(false);
    setDono(null);
    setPlanoState(null);
    setPedidos([]);
    setCart([]);
    setIsCustomerView(false);
    setIsOnboarded(false);
    setActiveStep(0);
    sessionStorage.removeItem('catalogo_session_type');
    sessionStorage.removeItem('catalogo_session_slug');
    setActiveViewState('login');
  };

  const logoutSuperAdmin = () => {
    api.auth.logout();
    setIsSuperAdminLogado(false);
    sessionStorage.removeItem('catalogo_session_type');
    sessionStorage.removeItem('catalogo_superroot_auth');
    setActiveViewState('login');
  };

  const updateLojaDonoCredentials = async (slug: string, dados: Partial<LojaDono>) => {
    const rec = await getLoja(slug);
    if (!rec) return;
    const currentDono = rec.dono || { nome: '', email: '', telefone: '' };
    const updatedDono: LojaDono = {
      nome: dados.nome !== undefined ? dados.nome.trim() : currentDono.nome,
      email: dados.email !== undefined ? dados.email.trim() : currentDono.email,
      telefone: dados.telefone !== undefined ? dados.telefone.trim() : currentDono.telefone,
    };
    await updateLojaDono(slug, updatedDono);
    await refreshLojas();
  };

  const removeLoja = async (slug: string) => {
    if (isClienteLogado) return;
    await deleteLoja(slug);
    const metas = await getLojasMeta();
    setLojas(metas);
    if (activeSlug === slug) {
      setActiveSlug(metas[0]?.slug || null);
    }
  };

  // Publicação do JSON ficou fora do escopo (botão Publicar removido).

  // Backup geral do ecossistema (todas as lojas)
  const exportEcosystem = async (): Promise<string> => {
    if (isClienteLogado) return '{}';
    const all = await db.lojas.toArray();
    return JSON.stringify({ versao: '3.0', exportDate: new Date().toISOString(), lojas: all }, null, 2);
  };

  const importEcosystem = async (jsonStr: string): Promise<boolean> => {
    if (isClienteLogado) return false;
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.lojas || !Array.isArray(parsed.lojas)) return false;
      await db.transaction('rw', db.lojas, async () => {
        for (const rec of parsed.lojas) {
          if (rec && rec.slug && rec.data) await db.lojas.put(rec);
        }
      });
      await refreshLojas();
      return true;
    } catch {
      return false;
    }
  };

  // Backup da loja ativa (compat com AdminDashboard)
  const exportBackupJson = (): string => {
    return JSON.stringify(
      { versao: '3.0', slug: activeSlug, nichoId, config, empresa, categorias, produtos, exportDate: new Date().toISOString() },
      null,
      2
    );
  };

  const importBackupJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.nichoId) setNichoIdState(parsed.nichoId);
      if (parsed.config) setConfig(parsed.config);
      if (parsed.empresa) setEmpresa(parsed.empresa);
      if (parsed.categorias) setCategorias(parsed.categorias);
      if (parsed.produtos) setProdutos(parsed.produtos);
      setIsOnboarded(true);
      setActiveView('admin');
      return true;
    } catch {
      return false;
    }
  };

  const resetCatalog = () => {
    if (!activeSlug) return;
    const s = SAMPLE_DATA.restaurante;
    setNichoIdState('restaurante');
    setEmpresa(s.empresa);
    setCategorias(s.categorias);
    setProdutos(s.produtos);
    setConfig(getDefaultConfig('restaurante', 'sunset-view'));
    setIsOnboarded(false);
    setCart([]);
    setActiveStep(0);
    setActiveViewState('admin');
  };

  return (
    <CatalogContext.Provider
      value={{
        nichoId,
        config,
        empresa,
        categorias,
        produtos,
        cart,
        activeStep,
        activeView,
        isOnboarded,
        isCustomerView,
        isLoading,
        isClienteLogado,
        activeSlug,
        setActiveSlug,
        lojas,
        refreshLojas,
        selectLoja,
        createLoja,
        renameLoja,
        duplicateLoja,
        deleteLoja: removeLoja,
        liberarLoja,
        exportEcosystemJson: exportEcosystem,
        importEcosystemJson: importEcosystem,
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        setActiveStep,
        setActiveView,
        setNicho,
        setTema,
        customPalettes,
        addCustomPalette,
        updateCustomPalette,
        deleteCustomPalette,
        updateCustomColors,
        updateEmpresa,
        addCategoria,
        updateCategoria,
        deleteCategoria,
        addProduto,
        updateProduto,
        deleteProduto,
        reorderProdutos,
        trackCliqueLinkExterno,
        loadSampleDataForNiche,
        finishOnboarding,
        completeOnboarding: finishOnboarding,
        publicarCatalogo,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        tipoComida,
        setTipoComida,
        pedidos,
        registrarPedido,
        atualizarStatusPedido,
        resetCatalog,
        importBackupJson,
        exportBackupJson,
        isSuperAdminLogado,
        login,
        loginSuperAdmin,
        logoutSuperAdmin,
        updateLojaDonoCredentials,
        dono,
        registrarDono,
        loginDono,
        updateDono,
        logoutDono,
        plano,
        renovarPlano,
        setPlanoDias,
        togglePagamentoLoja,
        selecionarPlanoLoja,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error('useCatalog deve ser usado dentro de um CatalogProvider');
  }
  return ctx;
};
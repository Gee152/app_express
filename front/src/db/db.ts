import { Empresa, Categoria, Produto, Config, Pedido, LojaStatusEnum } from '../types';
import { calcularStatusLoja } from '../utils/lojaStatus';
import { api } from '../services/api';

/**
 * Snapshot completo de uma loja (tenant).
 */
export interface LojaSnapshot {
  empresa: Empresa;
  categorias: Categoria[];
  produtos: Produto[];
  config: Config;
  nichoId: string;
  isOnboarded: boolean;
  pedidos?: Pedido[];
}

export interface LojaDono {
  nome: string;
  email: string;
  telefone: string;
  senha?: string;
}

export type TipoPlano = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface PlanoCliente {
  tipo?: TipoPlano;
  inicio: number;
  dias: number;
  pago?: boolean;
  dataPagamento?: number;
  renovacoes: number;
  ultimaRenovacao?: number;
}

export interface LojaRecord {
  slug: string;
  nome: string;
  nichoId: string;
  isOnboarded: boolean;
  publicada: boolean;
  liberada: boolean;
  dono?: LojaDono;
  plano?: PlanoCliente;
  updatedAt: number;
  data: LojaSnapshot;
}

export interface LojaMeta {
  slug: string;
  nome: string;
  nichoId: string;
  isOnboarded: boolean;
  publicada: boolean;
  status: LojaStatusEnum;
  liberada: boolean;
  donoNome?: string;
  dono?: LojaDono;
  plano?: PlanoCliente;
  updatedAt: number;
  produtosCount?: number;
  temLoginSenha?: boolean;
  temPerfilConfigurado?: boolean;
  motivoIncompleto?: string[];
}

export function novoPlano(dias: number = 30): PlanoCliente {
  return { inicio: Date.now(), dias, renovacoes: 0 };
}

const LOCAL_STORAGE_CACHE_KEY = 'catalogo_express_stores_cache_v3';

function getLocalCache(): Record<string, LojaRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalCache(cache: Record<string, LojaRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota exceeded or storage error
  }
}

function mapBackendToRecord(backendStore: any): LojaRecord {
  const cfg = backendStore.config || {};
  return {
    slug: backendStore.slug,
    nome: backendStore.name,
    nichoId: cfg.nichoId || 'restaurante',
    isOnboarded: cfg.isOnboarded ?? false,
    publicada: backendStore.status === 'publicada',
    liberada: cfg.liberada ?? true,
    dono: cfg.dono,
    plano: {
      tipo: backendStore.planType || cfg.plano?.tipo || 'mensal',
      dias: backendStore.planDays || cfg.plano?.dias || 30,
      pago: backendStore.isPaid !== undefined ? backendStore.isPaid : (cfg.plano?.pago ?? false),
      dataPagamento: backendStore.paidAt ? new Date(backendStore.paidAt).getTime() : cfg.plano?.dataPagamento,
      inicio: backendStore.paidAt ? new Date(backendStore.paidAt).getTime() : (cfg.plano?.inicio || Date.now()),
      renovacoes: cfg.plano?.renovacoes || 0,
    },
    updatedAt: new Date(backendStore.updatedAt || Date.now()).getTime(),
    data: cfg.data || {
      empresa: cfg.empresa || { nome: backendStore.name, whatsapp: backendStore.whatsapp, telefone: backendStore.whatsapp },
      categorias: cfg.categorias || [],
      produtos: cfg.produtos || [],
      config: cfg.config || {},
      nichoId: cfg.nichoId || 'restaurante',
      isOnboarded: cfg.isOnboarded ?? false,
      pedidos: cfg.pedidos || [],
    },
  };
}

export async function getLojas(): Promise<LojaRecord[]> {
  try {
    const backendStores = await api.stores.list();
    if (backendStores && Array.isArray(backendStores)) {
      const records = backendStores.map(mapBackendToRecord);
      const cache: Record<string, LojaRecord> = {};
      records.forEach((r) => {
        cache[r.slug] = r;
      });
      setLocalCache(cache);
      return records.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  } catch {
    // Fallback para cache local se a API estiver indisponível
  }

  const cache = getLocalCache();
  return Object.values(cache).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getLojasMeta(): Promise<LojaMeta[]> {
  const all = await getLojas();
  return all.map((l) => {
    const s = calcularStatusLoja(l);
    return {
      slug: l.slug,
      nome: l.nome,
      nichoId: l.nichoId,
      isOnboarded: l.isOnboarded,
      publicada: s.isPublicada,
      status: s.status,
      liberada: l.liberada,
      donoNome: l.dono?.nome,
      dono: l.dono,
      plano: l.plano,
      updatedAt: l.updatedAt,
      produtosCount: s.totalProdutos,
      temLoginSenha: s.temLoginSenha,
      temPerfilConfigurado: s.temPerfilConfigurado,
      motivoIncompleto: s.motivoIncompleto,
    };
  });
}

export async function getLoja(slug: string): Promise<LojaRecord | undefined> {
  const cache = getLocalCache();
  try {
    const backendStore = await api.stores.getBySlug(slug);
    if (backendStore) {
      const record = mapBackendToRecord(backendStore);
      cache[slug] = record;
      setLocalCache(cache);
      return record;
    }
  } catch {
    // Fallback para cache local
  }
  return cache[slug];
}

export async function createNewLoja(loja: LojaRecord): Promise<void> {
  const cache = getLocalCache();
  cache[loja.slug] = { ...loja, updatedAt: Date.now() };
  setLocalCache(cache);

  // Chamada explícita e direta ao endpoint de criação POST /api/stores
  await api.stores.create({
    name: loja.nome,
    slug: loja.slug,
    whatsapp: loja.data?.empresa?.whatsapp || loja.dono?.telefone || '',
    status: 'rascunho',
    config: {
      nichoId: loja.nichoId,
      isOnboarded: loja.isOnboarded,
      liberada: loja.liberada,
      dono: loja.dono,
      plano: loja.plano,
      data: loja.data,
    },
  });
}

export async function saveLoja(loja: LojaRecord): Promise<void> {
  const cache = getLocalCache();
  cache[loja.slug] = { ...loja, updatedAt: Date.now() };
  setLocalCache(cache);

  try {
    // Atualiza no backend PostgreSQL
    await api.stores.update(loja.slug, {
      name: loja.nome,
      whatsapp: loja.data?.empresa?.whatsapp || loja.dono?.telefone || '',
      status: loja.publicada ? 'publicada' : 'rascunho',
      config: {
        nichoId: loja.nichoId,
        isOnboarded: loja.isOnboarded,
        liberada: loja.liberada,
        dono: loja.dono,
        plano: loja.plano,
        data: loja.data,
      },
    });
  } catch {
    // Se a loja ainda não existir no backend, realiza o fallback criando via POST
    try {
      await createNewLoja(loja);
    } catch (err) {
      console.warn('Não foi possível persistir no backend imediatamente:', err);
    }
  }
}

export async function updateLojaDono(slug: string, dono: LojaDono): Promise<void> {
  const existing = await getLoja(slug);
  if (!existing) return;
  existing.dono = dono;
  await saveLoja(existing);
}

export async function deleteLoja(slug: string): Promise<void> {
  const cache = getLocalCache();
  delete cache[slug];
  setLocalCache(cache);

  try {
    await api.stores.delete(slug);
  } catch (err) {
    console.warn('Erro ao deletar loja na API:', err);
  }
}

export async function countLojas(): Promise<number> {
  const all = await getLojas();
  return all.length;
}

/** Objeto compatível para operações de ecosistema / legado */
export const db = {
  lojas: {
    toArray: async () => getLojas(),
    get: async (slug: string) => getLoja(slug),
    put: async (loja: LojaRecord) => saveLoja(loja),
    delete: async (slug: string) => deleteLoja(slug),
  },
  transaction: async (_mode: string, _table: any, callback: () => Promise<void>) => {
    await callback();
  },
};

export const LOJAS_DB_NAME = 'CatalogoExpressAPI';
import React, { useState, useRef } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { CompanyEditor } from './CompanyEditor';
import { ProductManager } from './ProductManager';
import { ThemeManager } from './ThemeManager';
import { NICHOS, isNichoAgendamento } from '../../data/nichos';
import { calcularStatusPlano } from '../../utils/plano';
import {
  Package,
  FolderPlus,
  Rocket,
  Eye,
  Upload,
  RefreshCw,
  Store,
  Palette,
  Settings,
  Sparkles,
  Download,
  CalendarClock,
  Calendar,
  ExternalLink,
  AlertCircle,
  X,
  Copy,
  Check,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { toast } from '../ui/Toast';

export const AdminDashboard: React.FC = () => {
  const {
    empresa,
    updateEmpresa,
    produtos,
    categorias,
    nichoId,
    setActiveView,
    resetCatalog,
    loadSampleDataForNiche,
    exportBackupJson,
    importBackupJson,
    lojas,
    activeSlug,
    isClienteLogado,
    plano,
    pedidos,
    agendamentos,
    dono,
    logoutDono,
    isDarkMode,
    toggleDarkMode,
    publicarCatalogo,
  } = useCatalog();

  const [activeTab, setActiveTab] = useState<'produtos' | 'empresa' | 'tema' | 'config'>('produtos');
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [isPublicando, setIsPublicando] = useState(false);
  const [publicouComSucesso, setPublicouComSucesso] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para Modal de Conexão com Google Agenda do Dono
  const [modalGoogleAgendaAberto, setModalGoogleAgendaAberto] = useState(false);
  const [tempAgendaEmail, setTempAgendaEmail] = useState(() => empresa.emailGoogleAgenda || empresa.email || '');
  const [agendaEmailErro, setAgendaEmailErro] = useState('');
  const agendaEmailRef = useRef<HTMLInputElement>(null);

  const handleSalvarConexaoGoogleAgenda = () => {
    const emailLimpo = tempAgendaEmail.trim();
    if (!emailLimpo) {
      setAgendaEmailErro('Por favor, informe seu e-mail do Google Agenda.');
      agendaEmailRef.current?.focus();
      return;
    }
    if (!emailLimpo.includes('@') || !emailLimpo.includes('.')) {
      setAgendaEmailErro('Informe um e-mail válido com @ e domínio.');
      agendaEmailRef.current?.focus();
      return;
    }
    setAgendaEmailErro('');
    updateEmpresa({ emailGoogleAgenda: emailLimpo });
    if (activeSlug) {
      try {
        localStorage.setItem(`google_agenda_email_${activeSlug}`, emailLimpo);
      } catch (_) {}
    }
    toast.success('Google Agenda conectado com sucesso à sua loja!');
    setModalGoogleAgendaAberto(false);
  };

  const handleDesconectarGoogleAgenda = () => {
    updateEmpresa({ emailGoogleAgenda: '' });
    if (activeSlug) {
      try {
        localStorage.removeItem(`google_agenda_email_${activeSlug}`);
      } catch (_) {}
    }
    setTempAgendaEmail('');
    setAgendaEmailErro('');
    toast.info('Google Agenda desconectado.');
    setModalGoogleAgendaAberto(false);
  };

  React.useEffect(() => {
    if (!empresa.emailGoogleAgenda && activeSlug) {
      try {
        const salvo = localStorage.getItem(`google_agenda_email_${activeSlug}`);
        if (salvo && salvo.includes('@')) {
          updateEmpresa({ emailGoogleAgenda: salvo });
        }
      } catch (_) {}
    }
  }, [activeSlug, empresa.emailGoogleAgenda, updateEmpresa]);

  const handleAcaoGoogleAgenda = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Se já estiver conectado e configurado com e-mail, NÃO permite o modal aparecer: abre direto o Google Agenda
    if (empresa.emailGoogleAgenda && empresa.emailGoogleAgenda.trim()) {
      window.open('https://calendar.google.com', '_blank', 'noopener,noreferrer');
      return;
    }
    // Caso contrário, abre o modal para configurar e conectar
    setTempAgendaEmail(empresa.emailGoogleAgenda || empresa.email || '');
    setAgendaEmailErro('');
    setModalGoogleAgendaAberto(true);
  };

  const selectedNicho = NICHOS.find((n) => n.id === nichoId) || NICHOS[0];
  const isAgendamentoNiche = isNichoAgendamento(nichoId);

  const handlePublicarNoServidor = async () => {
    setIsPublicando(true);
    try {
      const res = await publicarCatalogo();
      if (res.ok) {
        setPublicouComSucesso(true);
        toast.success('Catálogo publicado com sucesso no servidor!');
        setTimeout(() => setPublicouComSucesso(false), 3000);
      } else {
        toast.error(res.mensagem || 'Não foi possível publicar as alterações no servidor.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro de comunicação ao publicar no servidor.');
    } finally {
      setIsPublicando(false);
    }
  };

  const copiarLinkVitrine = () => {
    if (!activeSlug) return;
    const url = window.location.origin + window.location.pathname + '?loja=' + encodeURIComponent(activeSlug);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setLinkCopiado(true);
        setTimeout(() => setLinkCopiado(false), 2500);
      });
    } else {
      window.prompt('Link da vitrine da sua loja:', url);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${(empresa.nome || 'catalogo').toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importBackupJson(content);
      if (ok) {
        toast.success('Backup restaurado com sucesso!');
      } else {
        toast.error('Erro ao importar o arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#121212] text-[#212529] dark:text-[#FFFFFF] pb-16 transition-colors duration-200">
      
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-md border-b border-[#E0E0E0] dark:border-[#333333] shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Header Title & Subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF2F7] dark:bg-[#2C2C2C] border border-[#E0E0E0] dark:border-[#333333] text-[#4F3BFF] dark:text-[#A58BFF] flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-2xs">
              ⚡
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base sm:text-lg text-[#212529] dark:text-[#FFFFFF] leading-tight truncate">
                Painel Admin — Catálogo Express
              </h1>
              <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] font-medium truncate">
                <strong className="text-[#212529] dark:text-[#FFFFFF]">{empresa.nome || 'Minha Loja'}</strong>
                {' · '}
                {isClienteLogado && dono?.nome ? `Olá, ${dono.nome}!` : selectedNicho.nome}
              </p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              onClick={handlePublicarNoServidor}
              disabled={isPublicando}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap disabled:opacity-60"
              title="Salvar e publicar dados no servidor"
            >
              {isPublicando ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              <span>{isPublicando ? 'Publicando...' : publicouComSucesso ? 'Publicado!' : 'Publicar'}</span>
            </button>

            <button
              onClick={() => setActiveView('public')}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Vitrine Pública</span>
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="px-3.5 py-2 rounded-xl bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] font-extrabold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
              title={isDarkMode ? 'Desativar Modo Escuro' : 'Ativar Modo Escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4F3BFF]" />}
              <span className="hidden md:inline">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>

            {isAgendamentoNiche ? (
              <>
                <button
                  onClick={() => setActiveView('agendamentos')}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap border border-teal-500/20"
                  title="Ver esteira de agendamentos e atendimentos"
                >
                  <CalendarClock className="w-4 h-4 text-white" />
                  <span>Agendamentos ({agendamentos.length})</span>
                </button>

                {/* Se ainda NÃO estiver conectado, exibe o botão. Quando conectado, este botão SOME e fica APENAS o de agendamentos */}
                {!empresa.emailGoogleAgenda && (
                  <button
                    type="button"
                    onClick={handleAcaoGoogleAgenda}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-extrabold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap border border-teal-300 dark:border-teal-700/80"
                    title="Conectar Google Agenda do dono da loja"
                  >
                    <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-300" />
                    <span>Conectar Agenda</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setActiveView('pedidos')}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#FAB005] dark:bg-[#424200] text-slate-950 dark:text-[#FFFF00] font-extrabold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                title="Ver pedidos e esteira de produção"
              >
                <Package className="w-4 h-4" />
                <span>Pedidos ({pedidos.length})</span>
              </button>
            )}

            {!isClienteLogado && (
              <button
                onClick={() => setActiveView('storemanager')}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#12B886] dark:bg-[#004D40] text-white dark:text-[#69F0AE] font-extrabold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap border border-emerald-500/20"
                title="Gerenciar Lojas (Super Admin)"
              >
                <Store className="w-4 h-4" />
                <span>Lojas ({lojas.length})</span>
              </button>
            )}

            {isClienteLogado && (
              <button
                onClick={logoutDono}
                className="px-3 py-2 rounded-xl bg-[#EDF2F7] dark:bg-[#2C2C2C] border border-[#E0E0E0] dark:border-[#333333] text-[#6C757D] dark:text-[#B0BEC5] font-bold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5 text-[#6C757D] dark:text-[#B0BEC5]" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Alerta de plano da loja ativa (visível para o root) */}
        {!isClienteLogado && plano && (() => {
          const st = calcularStatusPlano(plano);
          if (st.status === 'ativo') return null;
          const vencido = st.vencido;
          return (
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl border text-sm ${
                vencido ? 'border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-red-800 dark:text-red-300' : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
              }`}
            >
              <CalendarClock className={`w-5 h-5 flex-shrink-0 ${vencido ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
              <p className="text-xs md:text-sm font-semibold">
                {vencido
                  ? `O plano desta loja está vencido (fim em ${new Date(st.dataFim).toLocaleDateString('pt-BR')}).`
                  : `O plano desta loja vence em ${st.diasRestantes} dia(s). `}
                <span className="font-normal opacity-80">Renove em "Lojas (N)" {'>'} Renovar.</span>
              </p>
            </div>
          );
        })()}

        {/* Compartilhar loja (visível para o dono logado) */}
        {isClienteLogado && (
          <div className="p-5 rounded-2xl bg-[#1E1E1E] dark:bg-[#1E1E1E] border border-[#E0E0E0] dark:border-[#333333] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-11 h-11 rounded-2xl bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xs">
                📢
              </div>
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-base md:text-lg text-white">Link do seu Catálogo Digital</h3>
                <p className="text-xs md:text-sm text-[#B0BEC5]">
                  Envie o link para seus clientes acessarem sua vitrine.
                </p>
              </div>
            </div>
            <button
              onClick={copiarLinkVitrine}
              className="w-full sm:w-auto px-5 py-3 bg-[#12B886] dark:bg-[#004D40] dark:text-[#69F0AE] hover:brightness-110 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2.5 flex-shrink-0 z-10 border border-emerald-500/20"
            >
              {linkCopiado ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link da Loja</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Section 1: Dashboard Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
              <span className="text-xs font-bold uppercase tracking-wider">Produtos</span>
              <Package className="w-5 h-5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">{produtos.length}</p>
            <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">Cadastrados no catálogo</p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
              <span className="text-xs font-bold uppercase tracking-wider">Categorias</span>
              <FolderPlus className="w-5 h-5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">{categorias.length}</p>
            <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">Organizadas por nicho</p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
              <span className="text-xs font-bold uppercase tracking-wider">Status da Loja</span>
              <Rocket className="w-5 h-5 text-[#12B886] dark:text-[#69F0AE]" />
            </div>
            <p className="text-sm font-bold text-[#12B886] dark:text-[#69F0AE] bg-[#E6FFFA] dark:bg-[#004D40] border border-[#12B886]/20 px-2 py-1 rounded-md inline-block">
              Loja Pronta & Configurada
            </p>
            <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">
              {isAgendamentoNiche ? 'Pronta para receber agendamentos' : 'Pronta para receber pedidos'}
            </p>
          </div>

          {isAgendamentoNiche ? (
            <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-teal-200 dark:border-teal-900/60 shadow-xs flex flex-col justify-between gap-3 transition-all hover:border-teal-500 hover:shadow-sm">
              <div
                onClick={() => setActiveView('agendamentos')}
                className="cursor-pointer space-y-1 group"
              >
                <div className="flex items-center justify-between text-teal-700 dark:text-teal-400">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {nichoId === 'petshop' ? 'Agendamentos Pet' : 'Agendamentos'}
                  </span>
                  <CalendarClock className="w-5 h-5 group-hover:scale-110 transition-transform text-teal-700 dark:text-teal-400" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {agendamentos.length}
                </p>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1 group-hover:underline">
                  <span>Abrir Esteira de Atendimentos</span>
                  <span>→</span>
                </p>
              </div>

              {/* Botão de Conectar Google Agenda - só aparece enquanto não conectado. Quando conectado, SOME e fica só o card de agendamento */}
              {!empresa.emailGoogleAgenda && (
                <div className="pt-2.5 border-t border-slate-100 dark:border-[#283449]">
                  <button
                    type="button"
                    onClick={handleAcaoGoogleAgenda}
                    className="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 hover:bg-teal-100"
                    title="Conectar Google Agenda do dono da loja"
                  >
                    <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <span>Conectar Google Agenda</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => setActiveView('pedidos')}
              className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col justify-between gap-3 transition-all hover:border-amber-500 hover:shadow-sm cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Pedidos</span>
                  <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {pedidos.length}
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 group-hover:underline">
                  <span>Abrir Esteira de Pedidos</span>
                  <span>→</span>
                </p>
              </div>
              <div className="pt-2.5 border-t border-slate-100 dark:border-[#283449]">
                <div className="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Package className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Esteira de Produção</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Main Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E0E0E0] dark:border-[#333333] overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-2 ${
              activeTab === 'produtos'
                ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-xs'
                : 'bg-white dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#B0BEC5] border border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F5F7FB] dark:hover:bg-[#2C2C2C]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produtos e Categorias ({produtos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('empresa')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-2 ${
              activeTab === 'empresa'
                ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-xs'
                : 'bg-white dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#B0BEC5] border border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F5F7FB] dark:hover:bg-[#2C2C2C]'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Perfil da Empresa & Nicho</span>
          </button>

          <button
            onClick={() => setActiveTab('tema')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-2 ${
              activeTab === 'tema'
                ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-xs'
                : 'bg-white dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#B0BEC5] border border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F5F7FB] dark:hover:bg-[#2C2C2C]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Tema e Cores</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-2 ${
              activeTab === 'config'
                ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-xs'
                : 'bg-white dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#B0BEC5] border border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F5F7FB] dark:hover:bg-[#2C2C2C]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Backup e Configurações</span>
          </button>
        </div>

        {/* Section 4: Tab Content Rendering */}
        <div>
          {activeTab === 'produtos' && <ProductManager />}
          {activeTab === 'empresa' && <CompanyEditor />}
          {activeTab === 'tema' && <ThemeManager />}
          {activeTab === 'config' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-xl text-slate-900">Backup & Gerenciamento de Dados</h3>
                <p className="text-xs text-slate-500">Exporte ou importe backups do seu catálogo em formato JSON.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span>Exportar Backup do Catálogo</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    Baixe um arquivo JSON contendo todas as configurações, empresa, categorias e produtos para guardar de segurança.
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Backup .JSON</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Restaurar Backup Anterior</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    Selecione um arquivo de backup (.json) para restaurar completamente os dados do seu catálogo.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Selecionar Arquivo .JSON</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>Ações de Reinicialização</span>
                </h4>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (confirm('Deseja recarregar dados de exemplo para o nicho atual? Isso vai substituir seus itens atuais.')) {
                        loadSampleDataForNiche(nichoId);
                      }
                    }}
                    className="px-4 py-2 bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Recarregar Modelo de Exemplo do Nicho</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja resetar e refazer o Onboarding do zero?')) {
                        resetCatalog();
                      }
                    }}
                    className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Resetar Catálogo & Refazer Onboarding
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Conectar Google Agenda do Dono (não permitido aparecer se já estiver conectado e configurado) */}
      {modalGoogleAgendaAberto && !empresa.emailGoogleAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161E2E] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#283449] overflow-hidden">
            {/* Header com gradiente estilo Google Calendar */}
            <div className="p-5 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">
                  📅
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    Conectar Google Agenda
                  </h3>
                  <p className="text-xs text-teal-100">
                    Sincronização de atendimentos para o dono da loja
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalGoogleAgendaAberto(false);
                  setAgendaEmailErro('');
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Status do Vínculo */}
              <div className={`p-4 rounded-2xl border transition-all ${
                empresa.emailGoogleAgenda
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-50 dark:bg-[#1A2234] border-slate-200 dark:border-[#283449]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Status da Conexão:
                  </span>
                  {empresa.emailGoogleAgenda ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Conectado
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                      Não conectado
                    </span>
                  )}
                </div>
                {empresa.emailGoogleAgenda && (
                  <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 mt-1 truncate">
                    {empresa.emailGoogleAgenda}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Todos os agendamentos feitos na vitrine ou esteira incluirão seu e-mail como organizador/convidado principal no Google Agenda.
                </p>
              </div>

              {/* Form Input E-mail com Validação Inline */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Seu E-mail Google (Gmail ou Workspace) *
                  </label>
                  {agendaEmailErro && (
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {agendaEmailErro}
                    </span>
                  )}
                </div>
                <input
                  ref={agendaEmailRef}
                  type="email"
                  value={tempAgendaEmail}
                  onChange={(e) => {
                    setTempAgendaEmail(e.target.value);
                    if (agendaEmailErro) setAgendaEmailErro('');
                  }}
                  placeholder="exemplo@gmail.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    agendaEmailErro
                      ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500'
                  }`}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#283449]">
                <button
                  type="button"
                  onClick={handleSalvarConexaoGoogleAgenda}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Conexão</span>
                </button>

                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 dark:bg-[#1A2234] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs border border-slate-200 dark:border-[#283449] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Abrir Google Agenda</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>

                {empresa.emailGoogleAgenda && (
                  <button
                    type="button"
                    onClick={handleDesconectarGoogleAgenda}
                    className="w-full sm:w-auto py-2.5 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

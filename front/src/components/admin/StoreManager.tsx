import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { NICHOS } from '../../data/nichos';
import { LojaStatusEnum } from '../../types';
import { formatPublicagem } from '../../utils/publish';
import { calcularStatusPlano, rotuloStatus, formatarData, obterNomePlano } from '../../utils/plano';
import { rotuloStatusLoja } from '../../utils/lojaStatus';
import {
  Store,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Check,
  Zap,
  Globe,
  Download,
  Upload,
  Archive,
  ExternalLink,
  Send,
  Smartphone,
  CalendarClock,
  RefreshCw,
  LogOut,
  Key,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  Moon,
  Sun,
  Users,
  ShieldCheck,
  Crown,
  Search,
  Link2,
  Loader2,
} from 'lucide-react';
import { usePWA } from '@/src/hooks/usePWA';
import { PWAInstallModal } from '../pwa/PWAInstallModal';
import { Select } from '../ui/Select';
import { api } from '../../services/api';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId: string | null;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    whatsapp?: string;
  } | null;
}

export const StoreManager: React.FC = () => {
  const {
    lojas,
    activeSlug,
    setActiveSlug,
    selectLoja,
    createLoja,
    renameLoja,
    duplicateLoja,
    deleteLoja,
    liberarLoja,
    exportEcosystemJson,
    importEcosystemJson,
    setActiveView,
    isClienteLogado,
    renovarPlano,
    togglePagamentoLoja,
    logoutSuperAdmin,
    updateLojaDonoCredentials,
    isDarkMode,
    toggleDarkMode,
  } = useCatalog();

    const {
      isInstalled,
      canInstallPrompt,
      isIOS,
      showInstructionsModal,
      setShowInstructionsModal,
      triggerInstall,
    } = usePWA();

  const [newNome, setNewNome] = useState('');
  const [newNicho, setNewNicho] = useState('restaurante');
  const [creatingStore, setCreatingStore] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [filterModo, setFilterModo] = useState<'todas' | 'publicadas' | 'rascunho'>('todas');
  const [copied, setCopied] = useState<string | null>(null);
  const [accessCopied, setAccessCopied] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [modal, setModal] = useState<{ tipo: 'duplicar' | 'excluir'; slug: string; nome: string } | null>(null);
  const [novaNome, setNovaNome] = useState('');
  const [renew, setRenew] = useState<{ slug: string; nome: string; dias: string } | null>(null);

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editCredsModal, setEditCredsModal] = useState<{
    slug: string;
    nomeLoja: string;
    nome: string;
    email: string;
    senha: string;
    telefone: string;
  } | null>(null);
  const [savingCreds, setSavingCreds] = useState(false);
  const [credsSavedSuccess, setCredsSavedSuccess] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const ativaLiberada = !!lojas.find((l) => l.slug === activeSlug)?.liberada;

  // Estados e controle da visualização de Usuários & Permissões
  const [activeTab, setActiveTab] = useState<'lojas' | 'usuarios'>('lojas');
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [creationLinkCopied, setCreationLinkCopied] = useState(false);
  const [userAccessCopied, setUserAccessCopied] = useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const list = await api.users.list();
      setUsers(list || []);
    } catch (err: any) {
      setUsersError(err.message || 'Erro ao carregar lista de usuários do banco.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'usuarios') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  const handleCopyCreationLink = () => {
    const url = `${window.location.origin}/?criar=loja`;
    navigator.clipboard.writeText(url);
    setCreationLinkCopied(true);
    setTimeout(() => setCreationLinkCopied(false), 2500);
  };

  const handleCopyUserAccessLink = (slug: string) => {
    const url = `${window.location.origin}/?acesso=${slug}`;
    navigator.clipboard.writeText(url);
    setUserAccessCopied(slug);
    setTimeout(() => setUserAccessCopied(null), 2500);
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.store?.name?.toLowerCase().includes(q) ||
      u.store?.slug?.toLowerCase().includes(q)
    );
  });

  const openDuplicate = (slug: string, nome: string) => {
    setNovaNome(`${nome} (cópia)`);
    setModal({ tipo: 'duplicar', slug, nome });
  };

  const openDelete = (slug: string, nome: string) => {
    setModal({ tipo: 'excluir', slug, nome });
  };

  const confirmModal = async () => {
    if (!modal) return;
    if (modal.tipo === 'duplicar') {
      await duplicateLoja(modal.slug, novaNome.trim());
    } else {
      await deleteLoja(modal.slug);
    }
    setModal(null);
    setNovaNome('');
  };

  const cancelModal = () => {
    setModal(null);
    setNovaNome('');
  };

  const openRenew = (slug: string, nome: string, diasAtual?: number) => {
    setRenew({ slug, nome, dias: String(diasAtual || 30) });
  };

  const confirmRenew = async () => {
    if (!renew) return;
    const dias = parseInt(renew.dias, 10) || 30;
    await renovarPlano(renew.slug, dias);
    setRenew(null);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCredsModal) return;
    setSavingCreds(true);
    try {
      await updateLojaDonoCredentials(editCredsModal.slug, {
        nome: editCredsModal.nome,
        email: editCredsModal.email,
        senha: editCredsModal.senha,
        telefone: editCredsModal.telefone,
      });
      setCredsSavedSuccess(true);
      setTimeout(() => {
        setCredsSavedSuccess(false);
        setEditCredsModal(null);
      }, 1000);
    } catch (err) {
      alert('Erro ao salvar credenciais: ' + err);
    } finally {
      setSavingCreds(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome.trim()) {
      setCreateError('Por favor, informe o nome da loja.');
      return;
    }
    setCreatingStore(true);
    setCreateError(null);
    try {
      await createLoja(newNome.trim(), newNicho);
      setNewNome('');
    } catch (err: any) {
      setCreateError(err.message || 'Erro ao criar loja no servidor.');
    } finally {
      setCreatingStore(false);
    }
  };

  const publicadasCount = lojas.filter((l) => l.status === LojaStatusEnum.PUBLICADA || l.publicada).length;
  const rascunhosCount = lojas.filter((l) => l.status === LojaStatusEnum.RASCUNHO || !l.publicada).length;

  const filteredStores = lojas.filter((l) => {
    if (filterModo === 'publicadas') return l.status === LojaStatusEnum.PUBLICADA || l.publicada;
    if (filterModo === 'rascunho') return l.status === LojaStatusEnum.RASCUNHO || !l.publicada;
    return true;
  });

  const lojasVencidas = lojas.filter((l) => calcularStatusPlano(l.plano).vencido).length;
  const lojasExpirando = lojas.filter((l) => calcularStatusPlano(l.plano).venceEmBreve).length;
  const planoAlerta = lojasVencidas + lojasExpirando;

  const handleOpenStore = async (slug: string) => {
    await selectLoja(slug);
    setActiveView('admin');
  };

  const handleRenameStart = (slug: string, nome: string) => {
    setRenaming(slug);
    setRenameValue(nome);
  };

  const handleConfirmRename = (slug: string) => {
    if (renameValue.trim()) renameLoja(slug, renameValue.trim());
    setRenaming(null);
  };

  const handleDuplicate = async (slug: string) => {
    const novoNome = prompt('Nome da cópia (loja):')?.trim();
    await duplicateLoja(slug, novoNome || '');
  };

  const handleCopyLink = async (slug: string) => {
    const url = window.location.origin + window.location.pathname + '?loja=' + encodeURIComponent(slug);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      setCopied(slug);
      setTimeout(() => setCopied(null), 2500);
    } else {
      window.prompt('Link da loja:', url);
    }
  };

  const handleCopyAccessLink = async (slug: string) => {
    liberarLoja(slug);
    const url = window.location.origin + window.location.pathname + '?acesso=' + encodeURIComponent(slug) + '&cadastro=true';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      setAccessCopied(slug);
      setTimeout(() => setAccessCopied(null), 2500);
    } else {
      window.prompt('Link de acesso do cliente (comprador do sistema):', url);
    }
  };

  const handleSendAccessLink = async () => {
    if (activeSlug) await handleCopyAccessLink(activeSlug);
  };

  const handleSendStoreLink = async () => {
    if (!activeSlug || !ativaLiberada) return;
    await handleCopyLink(activeSlug);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleBackupGeral = async () => {
    const json = await exportEcosystemJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-ecossistema-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportGeral = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const ok = await importEcosystemJson(String(ev.target?.result || ''));
      if (ok) {
        alert('Backup geral restaurado com sucesso!');
      } else {
        alert('Falha ao importar o backup geral.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#121212] text-[#212529] dark:text-[#FFFFFF] pb-16 transition-colors duration-200">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-md border-b border-[#E0E0E0] dark:border-[#333333] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <h1 className="font-extrabold text-lg text-[#212529] dark:text-[#FFFFFF] leading-tight">Super Admin — Catálogo Express</h1>
              <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] font-medium">Ambiente centralizado multi-tenant (Dexie / IndexedDB)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="px-3.5 py-2 rounded-xl bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] font-extrabold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
              title={isDarkMode ? 'Desativar Modo Escuro' : 'Ativar Modo Escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4F3BFF]" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>

            <button
              onClick={() => {
                if (activeSlug) handleOpenStore(activeSlug);
              }}
              className="px-4 py-2 rounded-xl bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
            >
              Abrir no Editor
            </button>
            <button
              onClick={logoutSuperAdmin}
              className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 font-bold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              title="Encerrar sessão do Super Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E0E0] dark:border-[#333333] pb-3">
          <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('lojas')}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'lojas'
                  ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-xs'
                  : 'text-[#6C757D] dark:text-[#B0BEC5] hover:text-[#212529] dark:hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Lojas & Catálogos</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'lojas'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5]'
                }`}
              >
                {lojas.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('usuarios')}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'usuarios'
                  ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-xs'
                  : 'text-[#6C757D] dark:text-[#B0BEC5] hover:text-[#212529] dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuários & Permissões</span>
              {users.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === 'usuarios'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5]'
                  }`}
                >
                  {users.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCreationLink}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95 border border-emerald-400/20"
              title="Copiar link direto para envio a clientes cadastrarem novas lojas"
            >
              {creationLinkCopied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Link de Criação Copiado!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Copiar Link de Criação de Loja</span>
                </>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'usuarios' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stats Cards de Usuários */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
                <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
                  <span className="text-xs font-bold uppercase tracking-wider">Total de Usuários</span>
                  <Users className="w-5 h-5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">{users.length}</p>
                <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">Cadastrados no PostgreSQL</p>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
                <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
                  <span className="text-xs font-bold uppercase tracking-wider">Superroots (Mestres)</span>
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">
                  {users.filter((u) => u.role === 'superadmin').length}
                </p>
                <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">Acesso total ao ecossistema</p>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
                <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
                  <span className="text-xs font-bold uppercase tracking-wider">Clientes / Lojistas</span>
                  <User className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">
                  {users.filter((u) => u.role !== 'superadmin').length}
                </p>
                <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">Restrito à própria loja</p>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
                <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
                  <span className="text-xs font-bold uppercase tracking-wider">Lojas Vinculadas</span>
                  <Store className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">
                  {users.filter((u) => !!u.store).length}
                </p>
                <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">Lojas vinculadas no banco</p>
              </div>
            </div>

            {/* Banner com Instruções e Links Rápidos do Superroot */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Painel de Permissões & Distribuição</span>
                </div>
                <h3 className="font-extrabold text-base md:text-lg">Gestão de Usuários & Acessos de Clientes</h3>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Aqui você visualiza todos os usuários cadastrados diretamente no banco de dados. Você pode configurar a loja para o cliente e enviar o link de acesso ou fornecer o link de criação. O usuário cliente <strong>nunca</strong> terá acesso a informações de Superroot ou de outras lojas.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleCopyCreationLink}
                  className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-95"
                >
                  {creationLinkCopied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Link de Criação</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer"
                  title="Atualizar lista de usuários"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Barra de Pesquisa */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Pesquisar por nome, e-mail ou loja..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#4F3BFF] dark:focus:ring-[#7C4DFF] text-[#212529] dark:text-white placeholder-[#ADB5BD] dark:placeholder-[#757575] transition-all"
                />
              </div>
            </div>

            {/* Feedback de erro */}
            {usersError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-600 dark:text-red-400">
                {usersError}
              </div>
            )}

            {/* Listagem de Usuários */}
            {loadingUsers ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#4F3BFF] dark:text-[#7C4DFF] animate-spin mx-auto" />
                <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5]">Carregando usuários do banco de dados...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white dark:bg-[#1E1E1E] p-12 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] text-center space-y-2">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-extrabold text-sm text-[#212529] dark:text-white">Nenhum usuário encontrado</h4>
                <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5]">
                  {userSearch ? 'Tente ajustar sua busca por nome ou e-mail.' : 'Nenhum usuário cadastrado no momento.'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F9FA] dark:bg-[#252525] border-b border-[#E0E0E0] dark:border-[#333333] text-[#6C757D] dark:text-[#B0BEC5] font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-5 py-3.5">Usuário</th>
                        <th className="px-5 py-3.5">Nível de Permissão</th>
                        <th className="px-5 py-3.5">Loja Vinculada</th>
                        <th className="px-5 py-3.5">Data de Cadastro</th>
                        <th className="px-5 py-3.5 text-right">Ações & Links</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0] dark:divide-[#333333]">
                      {filteredUsers.map((u) => {
                        const isSuper = u.role === 'superadmin';
                        const initial = (u.name || u.email || 'U').charAt(0).toUpperCase();
                        const formattedDate = u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—';

                        return (
                          <tr key={u.id} className="hover:bg-[#F8F9FA] dark:hover:bg-[#252525]/60 transition-colors">
                            {/* Usuário (Avatar, Nome, Email) */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs flex-shrink-0 ${
                                    isSuper
                                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                                      : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                                  }`}
                                >
                                  {initial}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-[#212529] dark:text-white text-sm truncate flex items-center gap-1.5">
                                    <span>{u.name || 'Sem nome informado'}</span>
                                    {isSuper && <Crown className="w-3.5 h-3.5 text-amber-500 inline-block flex-shrink-0" />}
                                  </div>
                                  <div className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1 font-mono">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{u.email}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Nível de Permissão (Badge) */}
                            <td className="px-5 py-4">
                              {isSuper ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                  <span>Superroot Master</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Cliente / Lojista</span>
                                </span>
                              )}
                            </td>

                            {/* Loja Vinculada */}
                            <td className="px-5 py-4">
                              {u.store ? (
                                <div className="space-y-1">
                                  <div className="font-extrabold text-[#212529] dark:text-white text-xs">
                                    {u.store.name}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF]">
                                      /{u.store.slug}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        u.store.status === 'publicada'
                                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                      }`}
                                    >
                                      {u.store.status}
                                    </span>
                                  </div>
                                </div>
                              ) : isSuper ? (
                                <span className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5] italic">
                                  Acesso central a todas as lojas
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1">
                                  <span>Nenhuma loja vinculada</span>
                                </span>
                              )}
                            </td>

                            {/* Data de Cadastro */}
                            <td className="px-5 py-4 text-[#6C757D] dark:text-[#B0BEC5] font-mono text-[11px]">
                              {formattedDate}
                            </td>

                            {/* Ações */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {u.store?.slug ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyUserAccessLink(u.store!.slug)}
                                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[#4F3BFF] dark:text-[#A58BFF] font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"
                                      title="Copiar link de acesso para o cliente gerenciar a loja"
                                    >
                                      {userAccessCopied === u.store.slug ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                                          <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>Link Cliente</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenStore(u.store!.slug)}
                                      className="px-3 py-1.5 rounded-lg bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 text-white font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95 shadow-2xs"
                                      title="Abrir editor para configurar esta loja"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Configurar</span>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleCopyCreationLink}
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#2C2C2C] hover:bg-slate-200 dark:hover:bg-[#333333] text-[#212529] dark:text-white font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"
                                    title="Copiar link de criação de loja para o usuário"
                                  >
                                    <Link2 className="w-3.5 h-3.5" />
                                    <span>Link Criação</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stats (Cartões de métricas) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
              <span className="text-xs font-bold uppercase tracking-wider">Lojas Ativas</span>
              <Store className="w-5 h-5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">{lojas.length}</p>
            <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">Espaço para até 50 no MVP</p>
          </div>
          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
              <span className="text-xs font-bold uppercase tracking-wider">Publicadas</span>
              <Globe className="w-5 h-5 text-[#12B886] dark:text-[#69F0AE]" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">{publicadasCount}</p>
            <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">Lojas completas (login + catálogo)</p>
          </div>
          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-[#6C757D] dark:text-[#B0BEC5]">
              <span className="text-xs font-bold uppercase tracking-wider">Rascunhos</span>
              <Edit3 className="w-5 h-5 text-[#FAB005] dark:text-[#FFFF00]" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">{rascunhosCount}</p>
            <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">Em preparação ou cadastro pendente</p>
          </div>
        </div>

        {/* Alerta de planos */}
        {planoAlerta > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-sm text-red-800 dark:text-red-300">
            <CalendarClock className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-xs md:text-sm font-semibold">
              {lojasVencidas > 0 && `${lojasVencidas} loja(s) com plano vencido. `}
              {lojasExpirando > 0 && `${lojasExpirando} loja(s) vence(m) em até 5 dias. `}
              <span className="font-normal text-red-700 dark:text-red-400">
                Renove pelo botão no card da loja para reativar a contagem de 30 dias.
              </span>
            </p>
          </div>
        )}

        {/* Section 2: Quick Action Share Banner */}
        <div className="p-5 rounded-2xl bg-[#1E1E1E] dark:bg-[#1E1E1E] border border-[#E0E0E0] dark:border-[#333333] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xs">
              📲
            </div>
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-base md:text-lg text-white">Link do seu Catálogo Digital</h3>
              <p className="text-xs md:text-sm text-[#B0BEC5]">
                Ao finalizar envie o link da sua loja por esse botão
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto z-10">
            {!isClienteLogado && (
            <button
              onClick={handleSendAccessLink}
              className="w-full sm:w-auto px-5 py-3 bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2.5 flex-shrink-0"
              title="Enviar link de acesso ao comprador do sistema (abre o onboarding da loja)"
            >
              {accessCopied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Link Login Cliente Copiado!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Link Login para o Cliente</span>
                </>
              )}
            </button>
            )}

            {ativaLiberada ? (
              <button
                onClick={handleSendStoreLink}
                className="w-full sm:w-auto px-5 py-3 bg-[#12B886] dark:bg-[#004D40] dark:text-[#69F0AE] hover:brightness-110 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2.5 flex-shrink-0 border border-emerald-500/20"
              >
                {linkCopied ? (
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
            ) : (
              <div
                className="w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-dashed border-[#E0E0E0] dark:border-[#333333] text-[#6C757D] dark:text-[#B0BEC5] font-bold text-[11px] md:text-xs text-center flex-shrink-0"
                title="O link público só fica disponível depois de liberar o acesso ao comprador"
              >
                Link da loja liberado após o "Copiar Link de Acesso"
              </div>
            )}
          </div>
        </div>

        {/* Backup geral */}
        <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-4 transition-colors">
          <h3 className="font-extrabold text-base text-[#212529] dark:text-[#FFFFFF] flex items-center gap-2">
            <Archive className="w-5 h-5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
            Backup Geral do Ecossistema
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBackupGeral}
              className="px-4 py-2.5 bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] hover:brightness-95 dark:hover:brightness-125 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar Backup de Todas as Lojas
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] hover:brightness-95 dark:hover:brightness-125 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Restaurar Backup Geral
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportGeral} className="hidden" />
          </div>
        </div>

        {/* Filtro com contadores dinâmicos */}
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              ['todas', 'Todas', lojas.length],
              ['publicadas', 'Publicadas', publicadasCount],
              ['rascunho', 'Rascunho', rascunhosCount],
            ] as const
          ).map(([k, label, count]) => (
            <button
              key={k}
              onClick={() => setFilterModo(k)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                filterModo === k
                  ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1E1E1E] text-[#6C757D] dark:text-[#B0BEC5] border border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F5F7FB] dark:hover:bg-[#2C2C2C]'
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold transition-all ${
                  filterModo === k
                    ? 'bg-black/20 text-white'
                    : 'bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF]'
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Grid de lojas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card para Adicionar Nova Loja no mesmo formato do grid */}
          <div className="p-4 rounded-2xl border-2 border-dashed border-[#4F3BFF]/40 dark:border-[#7C4DFF]/50 bg-white dark:bg-[#1E1E1E] shadow-xs space-y-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white flex items-center justify-center font-black shadow-xs flex-shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-[#212529] dark:text-[#FFFFFF] truncate">Nova Loja / Cliente</h4>
                    <span className="text-[11px] text-[#4F3BFF] dark:text-[#A58BFF] font-bold block truncate">Criar novo catálogo</span>
                  </div>
                </div>
                <span className="text-[10px] bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0">
                  + Nova
                </span>
              </div>

              <form 
                onSubmit={handleCreate} 
                className="space-y-2.5 pt-1" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6C757D] dark:text-[#B0BEC5]">Nome da Loja</label>
                  <input
                    type="text"
                    value={newNome}
                    onChange={(e) => {
                      setNewNome(e.target.value);
                      if (createError) setCreateError(null);
                    }}
                    placeholder="Ex: Burger Recife"
                    disabled={creatingStore}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-xs outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] focus:ring-2 focus:ring-[#4F3BFF]/20 dark:focus:ring-[#895FFF]/20 bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] placeholder-[#ADB5BD] dark:placeholder-[#757575] disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6C757D] dark:text-[#B0BEC5]">Nicho de Mercado</label>
                  <Select
                    value={newNicho}
                    onChange={(v) => setNewNicho(String(v))}
                    options={NICHOS.map((n) => ({ value: n.id, label: `${n.icone} ${n.nome}` }))}
                    buttonClassName="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-xs bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] text-left font-medium"
                  />
                </div>

                {createError && (
                  <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-[11px] font-medium leading-relaxed">
                    ⚠️ {createError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creatingStore}
                  className="w-full py-2.5 bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 active:scale-95"
                >
                  {creatingStore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Criando no Servidor...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Criar Loja</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="text-[10px] text-[#6C757D] dark:text-[#757575] text-center">
              Ao criar, você entra automaticamente no painel da loja.
            </p>
          </div>

          {filteredStores.map((l) => {
              const nicho = NICHOS.find((n) => n.id === l.nichoId);
              const isSelected = activeSlug === l.slug;
              const isPub = l.status === LojaStatusEnum.PUBLICADA || l.publicada;
              const statusBadge = rotuloStatusLoja(isPub ? LojaStatusEnum.PUBLICADA : LojaStatusEnum.RASCUNHO);

              return (
                <div
                  key={l.slug}
                  onClick={() => setActiveSlug(l.slug)}
                  className={`p-4 rounded-2xl border-2 shadow-xs space-y-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected
                      ? 'border-[#4F3BFF] dark:border-[#7C4DFF] ring-4 ring-[#4F3BFF]/20 dark:ring-[#7C4DFF]/20 bg-indigo-50/20 dark:bg-[#2C2C2C]/50 shadow-md'
                      : 'border-[#E0E0E0] dark:border-[#333333] hover:border-[#4F3BFF]/50 dark:hover:border-[#7C4DFF]/50 bg-white dark:bg-[#1E1E1E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl">{isSelected ? '📍' : nicho?.icone || '🏷️'}</span>
                      <div className="min-w-0">
                        {renaming === l.slug ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirmRename(l.slug);
                              }}
                              className="px-2 py-0.5 text-xs font-bold border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] rounded w-full outline-none"
                            />
                            <button onClick={() => handleConfirmRename(l.slug)} className="p-1 text-emerald-600 dark:text-emerald-400 cursor-pointer">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <h4 className="font-bold text-sm text-[#212529] dark:text-[#FFFFFF] truncate">{l.nome}</h4>
                        )}
                        <span className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5] font-mono">/{l.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isSelected && (
                        <span className="text-[10px] bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <span>✓</span>
                          <span>Ativa</span>
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge.cor}`}>
                        {statusBadge.icone} {statusBadge.texto}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5] flex items-center justify-between gap-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Store className="w-3 h-3 text-[#4F3BFF] dark:text-[#7C4DFF]" /> {nicho?.nome || 'Geral'}
                    </span>
                    {l.updatedAt > 0 && <span className="text-[#6C757D] dark:text-[#757575]">· {formatPublicagem(new Date(l.updatedAt).toISOString())}</span>}
                  </div>

                  {/* Checklist visual de conclusão da loja */}
                  <div className="flex items-center gap-1.5 text-[10px] bg-[#EDF2F7] dark:bg-[#2C2C2C] px-2.5 py-1.5 rounded-xl text-[#6C757D] dark:text-[#B0BEC5] font-medium">
                    <span className={`flex items-center gap-1 ${l.temLoginSenha ? 'text-[#12B886] dark:text-[#69F0AE] font-bold' : 'text-[#6C757D] dark:text-[#757575]'}`}>
                      {l.temLoginSenha ? '✓' : '○'} Login
                    </span>
                    <span className="opacity-40">·</span>
                    <span className={`flex items-center gap-1 ${l.temPerfilConfigurado ? 'text-[#12B886] dark:text-[#69F0AE] font-bold' : 'text-[#6C757D] dark:text-[#757575]'}`}>
                      {l.temPerfilConfigurado ? '✓' : '○'} Perfil
                    </span>
                    <span className="opacity-40">·</span>
                    <span className={`flex items-center gap-1 ${(l.produtosCount || 0) > 0 ? 'text-[#12B886] dark:text-[#69F0AE] font-bold' : 'text-[#6C757D] dark:text-[#757575]'}`}>
                      {(l.produtosCount || 0) > 0 ? `✓ ${l.produtosCount} prod.` : '○ 0 prod.'}
                    </span>
                  </div>

                  {/* Credenciais de Acesso do Usuário / Dono da Loja */}
                  <div className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#2C2C2C]/50 border border-[#E0E0E0] dark:border-[#333333] space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#212529] dark:text-[#FFFFFF] flex items-center gap-1.5 text-[11px]">
                        <Key className="w-3.5 h-3.5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
                        <span>Acesso do Usuário</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditCredsModal({
                            slug: l.slug,
                            nomeLoja: l.nome,
                            nome: l.dono?.nome || l.donoNome || `Admin ${l.nome}`,
                            email: l.dono?.email || `${l.slug}@loja.com`,
                            senha: l.dono?.senha || '123456',
                            telefone: l.dono?.telefone || '',
                          });
                        }}
                        className="text-[10px] font-bold text-[#4F3BFF] dark:text-[#A58BFF] bg-[#EDF2F7] dark:bg-[#2C2C2C] hover:brightness-95 dark:hover:brightness-125 px-2 py-0.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] cursor-pointer inline-flex items-center gap-1 transition-colors"
                        title="Editar login e senha do dono da loja"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Editar Login/Senha</span>
                      </button>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[#6C757D] dark:text-[#B0BEC5] font-medium">Nome:</span>
                        <span className="font-semibold text-[#212529] dark:text-[#FFFFFF] truncate max-w-[170px]">
                          {l.dono?.nome || l.donoNome || `Admin ${l.nome}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[#6C757D] dark:text-[#B0BEC5] font-medium">Login/E-mail:</span>
                        <span className="font-mono text-[#4F3BFF] dark:text-[#A58BFF] font-bold truncate max-w-[170px]">
                          {l.dono?.email || `${l.slug}@loja.com`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[#6C757D] dark:text-[#B0BEC5] font-medium">Senha:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-[#212529] dark:text-[#FFFFFF] bg-white dark:bg-[#1E1E1E] px-2 py-0.5 rounded border border-[#E0E0E0] dark:border-[#333333] text-[11px] select-all">
                            {visiblePasswords[l.slug] ? (l.dono?.senha || '123456') : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisiblePasswords((prev) => ({
                                ...prev,
                                [l.slug]: !prev[l.slug],
                              }));
                            }}
                            className="p-1 text-[#6C757D] dark:text-[#B0BEC5] hover:text-[#4F3BFF] dark:hover:text-[#A58BFF] cursor-pointer transition-colors"
                            title={visiblePasswords[l.slug] ? 'Ocultar senha' : 'Exibir senha'}
                          >
                            {visiblePasswords[l.slug] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Plano Contratado & Toggle de Pagamento do Superoot */}
                  <div className="pt-2 border-t border-[#E0E0E0]/60 dark:border-[#333333]/60 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Plano:</span>
                        <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
                          {obterNomePlano(l.plano?.tipo)}
                        </span>
                      </div>

                      {/* Superoot Payment Toggle */}
                      <div
                        className="flex items-center gap-1.5 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="text-[10px] font-bold text-[#6C757D] dark:text-[#B0BEC5] cursor-pointer select-none">
                          {l.plano?.pago !== false ? 'Pago' : 'Pendente'}
                        </label>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={l.plano?.pago !== false}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const novoEstado = !(l.plano?.pago !== false);
                            await togglePagamentoLoja(l.slug, novoEstado);
                          }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer focus:outline-hidden ${
                            l.plano?.pago !== false
                              ? 'bg-emerald-500'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={
                            l.plano?.pago !== false
                              ? 'Pagamento confirmado. Clique para marcar como pendente.'
                              : 'Clique para confirmar o pagamento e ativar a contagem de expiração do plano.'
                          }
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              l.plano?.pago !== false ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Status de Expiração & Ações de Renovação */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${rotuloStatus(l.plano).cor}`}>
                        {rotuloStatus(l.plano).texto}
                      </span>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {l.plano?.pago !== false && calcularStatusPlano(l.plano).dataFim > 0 && (
                          <span className="text-[10px] text-[#6C757D] dark:text-[#B0BEC5]">
                            fim {formatarData(calcularStatusPlano(l.plano).dataFim)}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRenew(l.slug, l.nome, l.plano?.dias);
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] hover:brightness-95 dark:hover:brightness-125 transition-all cursor-pointer inline-flex items-center gap-1"
                          title="Ajustar ou renovar período do plano"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Ajustar</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#333333] flex flex-wrap gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenStore(l.slug);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white'
                          : 'bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] hover:brightness-95 dark:hover:brightness-125'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir no Editor
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameStart(l.slug, l.nome);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5] hover:bg-[#E0E0E0] dark:hover:bg-[#333333] transition-all cursor-pointer"
                      title="Renomear"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDuplicate(l.slug, l.nome);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5] hover:bg-[#E0E0E0] dark:hover:bg-[#333333] transition-all cursor-pointer"
                      title="Duplicar"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDelete(l.slug, l.nome);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-1 space-y-1.5">
                    {l.liberada ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(l.slug);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg text-[11px] border border-[#E0E0E0] dark:border-[#333333] bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] hover:brightness-95 dark:hover:brightness-125 transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                        title="Copiar o link público da loja (disponível por acesso liberado)"
                      >
                        {copied === l.slug ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied === l.slug ? 'Link copiado!' : 'Copiar link da loja'}</span>
                      </button>
                    ) : (
                      <div className="w-full px-2 py-1.5 rounded-lg text-[11px] border border-dashed border-[#E0E0E0] dark:border-[#333333] text-[#6C757D] dark:text-[#757575] text-center">
                        Link público liberado após "Copiar link de acesso"
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAccessLink(l.slug);
                      }}
                      className="w-full px-2 py-1.5 rounded-lg text-[11px] border border-[#E0E0E0] dark:border-[#333333] bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#12B886] dark:text-[#69F0AE] hover:brightness-95 dark:hover:brightness-125 transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                      title="Copiar link de acesso para o comprador do sistema"
                    >
                      {accessCopied === l.slug ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                      <span>{accessCopied === l.slug ? 'Link de acesso copiado!' : 'Copiar link de acesso'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Ajuda sobre publicação */}
        <div className="p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] bg-[#EDF2F7]/50 dark:bg-[#1E1E1E] text-xs text-[#6C757D] dark:text-[#B0BEC5] space-y-2 transition-colors">
          <h4 className="font-bold text-[#212529] dark:text-[#FFFFFF] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#4F3BFF] dark:text-[#7C4DFF]" /> Como publicar?
          </h4>
          <p>
            Clique em <strong>Publicar</strong> para gerar o arquivo <code>lojas/&lt;slug&gt;.json</code>. Guarde-o na pasta{' '}
            <code>public/lojas/</code> do projeto (ou envie ao seu Gist/armazenamento) e faça o deploy no GitHub Pages. O cliente
            acessa <code>?loja=</code> e a SPA monta a vitrine automaticamente.
          </p>
        </div>
        </div>
      )}
      </main>

      {/* Modal de confirmação (duplicar / excluir) */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xl p-6 space-y-4 text-[#212529] dark:text-[#FFFFFF]">
            <h3 className="font-extrabold text-lg text-[#212529] dark:text-[#FFFFFF]">
              {modal.tipo === 'duplicar' ? 'Duplicar Loja' : 'Excluir Loja'}
            </h3>

            {modal.tipo === 'duplicar' ? (
              <div className="space-y-2">
                <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5]">
                  Confirme para criar uma cópia de <strong className="text-[#212529] dark:text-[#FFFFFF]">{modal.nome}</strong>.
                </p>
                <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">Nome da cópia</label>
                <input
                  type="text"
                  value={novaNome}
                  onChange={(e) => setNovaNome(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmModal();
                    if (e.key === 'Escape') cancelModal();
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-sm outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] focus:ring-2 focus:ring-[#4F3BFF]/20 dark:focus:ring-[#895FFF]/20 bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] placeholder-[#ADB5BD] dark:placeholder-[#757575]"
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400">
                Tem certeza que deseja excluir a loja <strong>{modal.nome}</strong>? Essa ação não pode ser desfeita.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={cancelModal}
                className="px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#212529] dark:text-[#FFFFFF] hover:brightness-95 dark:hover:brightness-125 font-bold text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              {modal.tipo === 'duplicar' && (
                <button
                  onClick={confirmModal}
                  className="px-4 py-2.5 rounded-xl bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicar
                </button>
              )}
              {modal.tipo === 'excluir' && (
                <button
                  onClick={confirmModal}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de renovação de plano */}
      {renew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xl p-6 space-y-4 text-[#212529] dark:text-[#FFFFFF]">
            <h3 className="font-extrabold text-lg text-[#212529] dark:text-[#FFFFFF]">Renovar Plano</h3>
            <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5]">
              Reiniciar a contagem do plano de <strong className="text-[#212529] dark:text-[#FFFFFF]">{renew.nome}</strong> a partir de hoje por:
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">Dias do plano</label>
              <input
                type="number"
                min={1}
                value={renew.dias}
                onChange={(e) => setRenew({ ...renew, dias: e.target.value })}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmRenew();
                  if (e.key === 'Escape') setRenew(null);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-sm outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] focus:ring-2 focus:ring-[#4F3BFF]/20 dark:focus:ring-[#895FFF]/20 bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRenew(null)}
                className="px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#212529] dark:text-[#FFFFFF] hover:brightness-95 dark:hover:brightness-125 font-bold text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRenew}
                className="px-4 py-2.5 rounded-xl bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Renovar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Credenciais do Usuário da Loja */}
      {editCredsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-3xl border border-[#E0E0E0] dark:border-[#333333] shadow-2xl p-6 sm:p-7 space-y-5 text-[#212529] dark:text-[#FFFFFF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0] dark:border-[#333333]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EDF2F7] dark:bg-[#2C2C2C] border border-[#E0E0E0] dark:border-[#333333] text-[#4F3BFF] dark:text-[#A58BFF] flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-[#212529] dark:text-[#FFFFFF] leading-tight">
                    Credenciais da Loja
                  </h3>
                  <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] font-medium">{editCredsModal.nomeLoja}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditCredsModal(null)}
                className="text-[#6C757D] dark:text-[#B0BEC5] hover:text-[#212529] dark:hover:text-[#FFFFFF] p-1.5 rounded-xl hover:bg-[#EDF2F7] dark:hover:bg-[#2C2C2C] cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {credsSavedSuccess && (
              <div className="p-3 bg-[#E6FFFA] dark:bg-[#004D40] border border-[#12B886]/30 dark:border-[#69F0AE]/40 text-[#12B886] dark:text-[#69F0AE] rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-[#12B886] dark:text-[#69F0AE] stroke-[3]" />
                <span>Credenciais salvas com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
                  <span>Nome do Dono / Comprador</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={editCredsModal.nome}
                  onChange={(e) => setEditCredsModal({ ...editCredsModal, nome: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-sm outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] focus:ring-2 focus:ring-[#4F3BFF]/20 dark:focus:ring-[#895FFF]/20 bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] placeholder-[#ADB5BD] dark:placeholder-[#757575]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
                  <span>Login / E-mail de Acesso</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="usuario@dominio.com"
                  value={editCredsModal.email}
                  onChange={(e) => setEditCredsModal({ ...editCredsModal, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-sm font-mono outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] focus:ring-2 focus:ring-[#4F3BFF]/20 dark:focus:ring-[#895FFF]/20 bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] placeholder-[#ADB5BD] dark:placeholder-[#757575]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
                  <span>Senha do Usuário da Loja</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Senha (mínimo 4 caracteres)"
                  value={editCredsModal.senha}
                  onChange={(e) => setEditCredsModal({ ...editCredsModal, senha: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-sm font-mono font-bold outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] focus:ring-2 focus:ring-[#4F3BFF]/20 dark:focus:ring-[#895FFF]/20 bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] placeholder-[#ADB5BD] dark:placeholder-[#757575]"
                />
                <p className="text-[10px] text-[#6C757D] dark:text-[#757575]">
                  O dono da loja usará este e-mail e senha para gerenciar seus produtos.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#4F3BFF] dark:text-[#7C4DFF]" />
                  <span>Telefone / WhatsApp</span>
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={editCredsModal.telefone}
                  onChange={(e) => setEditCredsModal({ ...editCredsModal, telefone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-sm outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] focus:ring-2 focus:ring-[#4F3BFF]/20 dark:focus:ring-[#895FFF]/20 bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] placeholder-[#ADB5BD] dark:placeholder-[#757575]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setEditCredsModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#212529] dark:text-[#FFFFFF] hover:brightness-95 dark:hover:brightness-125 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCreds}
                  className="px-5 py-2.5 rounded-xl bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  {savingCreds ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Salvar Credenciais</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Botão Flutuante PWA Web & Mobile */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          type="button"
          onClick={() => {
            if (canInstallPrompt) {
              triggerInstall();
            } else {
              setShowInstructionsModal(true);
            }
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] font-extrabold text-xs sm:text-sm shadow-2xl hover:brightness-95 dark:hover:brightness-125 border border-[#E0E0E0] dark:border-[#333333] transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          title="Instalar aplicativo PWA no dispositivo"
        >
          <div className="w-6 h-6 rounded-full bg-[#4F3BFF]/20 dark:bg-[#7C4DFF]/30 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-3.5 h-3.5 text-[#4F3BFF] dark:text-[#A58BFF] group-hover:scale-110 transition-transform" />
          </div>
          <span className="tracking-tight">
            {isInstalled ? 'App PWA Instalado' : 'Baixar App PWA'}
          </span>
          <Download className="w-3.5 h-3.5 text-[#4F3BFF] dark:text-[#A58BFF] group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      <PWAInstallModal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        isIOS={isIOS}
        canInstallPrompt={canInstallPrompt}
        onInstallDirect={triggerInstall}
      />
    </div>
  );
};
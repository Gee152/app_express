import React, { useState, useEffect } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Mail, Lock, Eye, EyeOff, Loader2, Store, ArrowRight, Sparkles, AlertCircle, UserPlus } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, empresa, dono, activeSlug, setActiveView } = useCatalog();
  const [email, setEmail] = useState(() => dono?.email || '');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (dono?.email && !email) {
      setEmail(dono.email);
    }
  }, [dono?.email, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const res = await login(email.trim(), senha.trim());
      if (!res.ok) {
        setErro(res.mensagem || 'E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    } catch {
      setErro('Erro ao processar login. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 border border-white/20">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
              <Sparkles className="w-3 h-3" />
              Acesso ao Sistema
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Catálogo Express</h1>
            <p className="text-xs text-slate-400">
              Digite seu e-mail e senha para acessar o painel de gerenciamento
            </p>
          </div>
        </div>

        {/* Info da Loja caso venha pelo link de acesso */}
        {typeof window !== 'undefined' && window.location.search.includes('loja=') && activeSlug && empresa?.nome && (
          <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl flex items-center gap-3">
            {empresa.logo ? (
              <img src={empresa.logo} alt={empresa.nome} className="w-10 h-10 rounded-xl object-cover border border-indigo-400/30 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1 text-left">
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold block">Acessando Loja</span>
              <p className="text-sm font-extrabold text-white truncate">{empresa.nome}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {erro && (
          <div className="p-3.5 bg-red-950/70 border border-red-800/80 text-red-300 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{erro}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>E-mail</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@dominio.com"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Senha</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-white/20"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>


        {/* Footer info e link para cadastro */}
        <div className="pt-2 text-center border-t border-slate-800/80 space-y-2">
          <div>
            <button
              type="button"
              onClick={() => setActiveView('cadastro')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Novo na plataforma? Criar uma conta para sua loja</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            O sistema identifica automaticamente seu nível de acesso:<br />
            <strong>Superroot:</strong> Painel de ecossistema e lojas.<br />
            <strong>Lojista:</strong> Configuração e administração da sua loja.
          </p>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Mail, Phone, User, Lock, Store, LogIn, Moon, Sun, ArrowRight, ArrowLeft } from 'lucide-react';
import { PlanSelectionStep } from './PlanSelectionStep';
import { TipoPlano } from '../../utils/plano';

export const CadastroScreen: React.FC = () => {
  const { registrarDono, empresa, setActiveView, isDarkMode, toggleDarkMode } = useCatalog();
  const [step, setStep] = useState<'dados' | 'plano'>('dados');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleAdvanceToPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const cleanNome = nome.trim();
    const cleanEmail = email.trim();
    const cleanTelefone = telefone.trim();

    if (!cleanNome) {
      setErro('Por favor, informe seu nome completo.');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErro('Informe um e-mail válido para acessar sua conta.');
      return;
    }
    if (!cleanTelefone) {
      setErro('Informe seu telefone ou WhatsApp.');
      return;
    }
    if (senha.length < 6) {
      setErro('Crie uma senha de acesso com no mínimo 6 caracteres.');
      return;
    }

    setStep('plano');
  };

  const handleConfirmPlan = async (planoTipo: TipoPlano) => {
    setErro('');
    setEnviando(true);
    try {
      const res = await registrarDono({ nome, email, telefone, senha }, planoTipo);
      if (!res.ok) {
        setErro(res.mensagem || 'Não foi possível concluir o cadastro.');
        setStep('dados');
      }
    } catch (err: any) {
      setErro(err.message || 'Erro inesperado ao registrar sua loja.');
      setStep('dados');
    } finally {
      setEnviando(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-sm outline-none focus:ring-2 focus:ring-[#4F3BFF] dark:focus:ring-[#7C4DFF] bg-white dark:bg-[#2C2C2C] text-[#212529] dark:text-[#FFFFFF] placeholder-[#ADB5BD] dark:placeholder-[#757575] transition-colors';

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#121212] text-[#212529] dark:text-[#FFFFFF] flex items-center justify-center p-4 relative transition-colors">
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-amber-400 hover:brightness-95 transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
        title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
      >
        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className={`w-full ${step === 'plano' ? 'max-w-2xl' : 'max-w-md'} transition-all duration-300`}>
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-[#E0E0E0] dark:border-[#333333] shadow-xl p-6 sm:p-8 space-y-6 transition-colors">
          {step === 'dados' ? (
            <>
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-[#4F3BFF]/10 dark:bg-[#7C4DFF]/20 border border-[#4F3BFF]/30 dark:border-[#7C4DFF]/40 text-[#4F3BFF] dark:text-[#A58BFF] flex items-center justify-center">
                  <Store className="w-7 h-7" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#212529] dark:text-[#FFFFFF] leading-tight">
                  Bem-vindo(a) à sua loja
                </h1>
                <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5]">
                  Configurando o catálogo de <strong className="text-[#4F3BFF] dark:text-[#A58BFF]">{empresa.nome || 'sua loja'}</strong>. Cadastre seus dados para começar.
                </p>
              </div>

              <form onSubmit={handleAdvanceToPlan} className="space-y-3.5">
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className={inputClass}
                    autoFocus
                  />
                </div>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail de acesso"
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 dark:text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Seu WhatsApp / Telefone"
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Crie uma senha segura (mín. 6 caracteres)"
                    className={inputClass}
                  />
                </div>

                {erro && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-xs font-semibold text-red-600 dark:text-red-300 animate-in fade-in">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Continuar para Escolha do Plano</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 text-center border-t border-[#E0E0E0] dark:border-[#333333] space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="text-xs font-semibold text-[#4F3BFF] dark:text-[#A58BFF] hover:underline cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Já possui login e senha? Entrar na loja</span>
                </button>

                <p className="text-[11px] text-[#ADB5BD] dark:text-[#757575]">
                  O telefone cadastrado será usado como WhatsApp oficial da sua loja.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('dados')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar e editar meus dados</span>
              </button>

              {erro && (
                <div className="px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-xs font-semibold text-red-600 dark:text-red-300">
                  {erro}
                </div>
              )}

              <PlanSelectionStep
                storeName={empresa.nome || nome}
                isLoading={enviando}
                onConfirmPlan={handleConfirmPlan}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PackageCheck,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useCustomerAuth, CustomerRegisterData } from '../../context/CustomerAuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { toast } from '../ui/Toast';

interface ExtraPetForm {
  name: string;
  breed: string;
  species: 'cao' | 'gato' | 'ave' | 'silvestre' | 'outro';
  specialCare: string;
  hasTransportBox: boolean;
}

export const CustomerAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    login,
    register
  } = useCustomerAuth();
  const { activeSlug, empresa } = useCatalog();

  const [tab, setTab] = useState<'login' | 'register'>(authModalMode || 'login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync tab with context modal mode whenever opened
  React.useEffect(() => {
    if (authModalMode) {
      setTab(authModalMode);
    }
    setErrorMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form states (Tutor)
  const [nomeCliente, setNomeCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [senhaCliente, setSenhaCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [temCaixaTransporte, setTemCaixaTransporte] = useState(false);

  // Register form states (Pet Principal)
  const [nomePet, setNomePet] = useState('');
  const [racaPet, setRacaPet] = useState('');
  const [especiePet, setEspeciePet] = useState<'cao' | 'gato' | 'ave' | 'silvestre' | 'outro'>('cao');
  const [cuidadosEspeciais, setCuidadosEspeciais] = useState('');

  // Pergunta: Tem mais de um pet?
  const [temMaisDeUmPet, setTemMaisDeUmPet] = useState(false);
  const [petsAdicionais, setPetsAdicionais] = useState<ExtraPetForm[]>([]);

  if (!isAuthModalOpen) return null;

  const handleAddPetAdicional = () => {
    setPetsAdicionais((prev) => [
      ...prev,
      {
        name: '',
        breed: '',
        species: 'cao',
        specialCare: '',
        hasTransportBox: temCaixaTransporte,
      },
    ]);
  };

  const handleRemovePetAdicional = (index: number) => {
    setPetsAdicionais((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePetAdicional = (index: number, field: keyof ExtraPetForm, value: any) => {
    setPetsAdicionais((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword, activeSlug || undefined);
      if (res.ok) {
        toast.success('Bem-vindo(a) de volta! Você já pode agendar ou comprar.');
        closeAuthModal();
      } else {
        setErrorMessage(res.message || 'E-mail ou senha inválidos.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao efetuar login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validações básicas
    if (!nomeCliente.trim()) {
      setErrorMessage('Informe o nome do tutor/cliente.');
      return;
    }
    if (!emailCliente.trim()) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }
    if (!senhaCliente.trim() || senhaCliente.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 dígitos.');
      return;
    }
    if (!nomePet.trim()) {
      setErrorMessage('Informe o nome do seu pet principal.');
      return;
    }

    const payload: CustomerRegisterData = {
      name: nomeCliente.trim(),
      email: emailCliente.toLowerCase().trim(),
      password: senhaCliente,
      phone: telefoneCliente.trim(),
      hasTransportBox: temCaixaTransporte,
      petName: nomePet.trim(),
      petBreed: racaPet.trim() || undefined,
      petSpecies: especiePet,
      petSpecialCare: cuidadosEspeciais.trim() || undefined,
    };

    if (temMaisDeUmPet && petsAdicionais.length > 0) {
      payload.pets = [
        {
          name: nomePet.trim(),
          breed: racaPet.trim() || undefined,
          species: especiePet,
          specialCare: cuidadosEspeciais.trim() || undefined,
          hasTransportBox: temCaixaTransporte,
        },
        ...petsAdicionais
          .filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name.trim(),
            breed: p.breed.trim() || undefined,
            species: p.species,
            specialCare: p.specialCare.trim() || undefined,
            hasTransportBox: p.hasTransportBox,
          })),
      ];
    }

    setIsSubmitting(true);
    try {
      const res = await register(payload, activeSlug || undefined);
      if (res.ok) {
        toast.success('🎉 Cadastro de tutor e pets realizado com sucesso!');
        closeAuthModal();
      } else {
        setErrorMessage(res.message || 'Erro ao realizar cadastro.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao criar conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161E2E] w-full max-w-xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#283449] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#283449] bg-slate-50/80 dark:bg-[#1E293B]/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
              🐾
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                Identificação do Tutor & Pet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {empresa?.nome || 'Catálogo Digital'} • Exigido para agendar ou comprar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-[#283449] bg-slate-100/60 dark:bg-[#0F172A]/40 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white dark:bg-[#1E293B] text-teal-700 dark:text-teal-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Já sou Cadastrado (Entrar)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white dark:bg-[#1E293B] text-teal-700 dark:text-teal-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Cadastro de Tutor</span>
          </button>
        </div>

        {/* Form Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB LOGIN */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/50 text-xs text-teal-900 dark:text-teal-200">
                👋 Olá! Faça login com seu e-mail cadastrado para prosseguir com a confirmação do seu agendamento ou pedido.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  E-mail do Tutor:
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-600" />
                  Senha de Acesso:
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-teal-700 hover:bg-teal-800 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Entrar e Continuar Agendamento</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                >
                  Não tem cadastro ainda? Clique aqui para cadastrar seu pet.
                </button>
              </div>
            </form>
          ) : (
            /* TAB CADASTRO */
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              
              {/* SEÇÃO 1: DADOS DO CLIENTE / TUTOR */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-xs font-black text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Dados do Cliente / Tutor</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nome do Cliente / Tutor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      placeholder="Ex: Ana Silva"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      WhatsApp / Telefone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefoneCliente}
                      onChange={(e) => setTelefoneCliente(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={emailCliente}
                      onChange={(e) => setEmailCliente(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Senha (mín. 6 caracteres) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={senhaCliente}
                      onChange={(e) => setSenhaCliente(e.target.value)}
                      placeholder="******"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Pergunta: Possui caixa de transporte? */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5 text-teal-600" />
                      Tem caixa de transporte própria?
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ajuda nossa equipe a preparar o transporte seguro do seu pet.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTemCaixaTransporte(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        temCaixaTransporte
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemCaixaTransporte(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        !temCaixaTransporte
                          ? 'bg-slate-700 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: DADOS DO PET PRINCIPAL */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    🐾 2. Dados do Pet
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Pet Principal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nome do Pet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nomePet}
                      onChange={(e) => setNomePet(e.target.value)}
                      placeholder="Ex: Thor, Mel..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Raça do Pet
                    </label>
                    <input
                      type="text"
                      value={racaPet}
                      onChange={(e) => setRacaPet(e.target.value)}
                      placeholder="Ex: Shih Tzu, SRD..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Espécie
                    </label>
                    <select
                      value={especiePet}
                      onChange={(e) => setEspeciePet(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    >
                      <option value="cao">🐶 Cão</option>
                      <option value="gato">🐱 Gato</option>
                      <option value="ave">🦜 Ave</option>
                      <option value="silvestre">🐰 Silvestre</option>
                      <option value="outro">🐾 Outro</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cuidados Especiais (Alergias, medos, remédios ou restrições):
                  </label>
                  <textarea
                    rows={2}
                    value={cuidadosEspeciais}
                    onChange={(e) => setCuidadosEspeciais(e.target.value)}
                    placeholder="Ex: Tem alergia a shampoo com perfume forte, não gosta que toquem nas patas traseiras..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* SEÇÃO 3: TEM MAIS DE UM PET? */}
              <div className="p-3.5 rounded-xl border border-dashed border-teal-300 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-teal-950 dark:text-teal-200">
                      Você tem mais de um pet?
                    </span>
                    <p className="text-[11px] text-teal-700 dark:text-teal-400">
                      Cadastre todos para facilitar seus próximos agendamentos.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTemMaisDeUmPet(true);
                        if (petsAdicionais.length === 0) {
                          handleAddPetAdicional();
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        temMaisDeUmPet
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTemMaisDeUmPet(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        !temMaisDeUmPet
                          ? 'bg-slate-700 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {/* Lista de Pets Adicionais */}
                {temMaisDeUmPet && (
                  <div className="space-y-3 pt-2">
                    {petsAdicionais.map((pet, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                            🐾 Pet Adicional #{idx + 2}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePetAdicional(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Nome do Pet *
                            </label>
                            <input
                              type="text"
                              required
                              value={pet.name}
                              onChange={(e) => handleUpdatePetAdicional(idx, 'name', e.target.value)}
                              placeholder="Nome do pet"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161E2E] text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Raça
                            </label>
                            <input
                              type="text"
                              value={pet.breed}
                              onChange={(e) => handleUpdatePetAdicional(idx, 'breed', e.target.value)}
                              placeholder="Raça"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161E2E] text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Espécie
                            </label>
                            <select
                              value={pet.species}
                              onChange={(e) => handleUpdatePetAdicional(idx, 'species', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161E2E] text-xs"
                            >
                              <option value="cao">🐶 Cão</option>
                              <option value="gato">🐱 Gato</option>
                              <option value="ave">🦜 Ave</option>
                              <option value="silvestre">🐰 Silvestre</option>
                              <option value="outro">🐾 Outro</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Cuidados Especiais:
                          </label>
                          <input
                            type="text"
                            value={pet.specialCare}
                            onChange={(e) => handleUpdatePetAdicional(idx, 'specialCare', e.target.value)}
                            placeholder="Alergias, remédios ou restrições..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161E2E] text-xs"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddPetAdicional}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-teal-500/50 hover:border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-teal-100/50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Outro Pet</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-teal-700 hover:bg-teal-800 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Criando Cadastro...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir Cadastro e Continuar Agendamento</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                >
                  Já tem conta? Clique aqui para fazer login.
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

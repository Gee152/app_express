import React, { useState, useMemo, useRef } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Produto, Agendamento, PetInfo, TutorInfo } from '../../types';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Phone,
  User,
  Heart,
  AlertCircle,
  Scissors,
  Stethoscope,
  Send,
} from 'lucide-react';
import { toast } from '../ui/Toast';

interface AgendamentoStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  horarioInicial?: string;
  dataInicial?: string;
  servicoInicialId?: number | string;
}

const HORARIOS_PADRAO = [
  '08:30', '09:15', '10:00', '10:45', '11:30',
  '13:30', '14:15', '15:00', '15:45', '16:30', '17:15', '18:00'
];

export const AgendamentoStepsModal: React.FC<AgendamentoStepsModalProps> = ({
  isOpen,
  onClose,
  horarioInicial,
  dataInicial,
  servicoInicialId,
}) => {
  const { produtos, empresa, activeSlug, adicionarAgendamento, agendamentos, isDarkMode } = useCatalog();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [sucesso, setSucesso] = useState(false);
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  const petNomeRef = useRef<HTMLInputElement>(null);
  const tutorNomeRef = useRef<HTMLInputElement>(null);
  const tutorWhatsappRef = useRef<HTMLInputElement>(null);
  const servicosContainerRef = useRef<HTMLDivElement>(null);
  const horariosContainerRef = useRef<HTMLDivElement>(null);

  // Step 1: Serviço selecionado
  const [servicoId, setServicoId] = useState<number | string>(() => servicoInicialId || '');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');

  // Step 2: Dados do Pet e do Tutor
  const [petNome, setPetNome] = useState('');
  const [petEspecie, setPetEspecie] = useState<PetInfo['especie']>('cao');
  const [petPorte, setPetPorte] = useState<PetInfo['porte']>('pequeno');
  const [petRaca, setPetRaca] = useState('');
  const [petIdade, setPetIdade] = useState('');
  const [petObservacoes, setPetObservacoes] = useState('');

  const [tutorNome, setTutorNome] = useState('');
  const [tutorWhatsapp, setTutorWhatsapp] = useState('');

  // Step 3: Data e Horário
  const getTodayStr = () => new Date().toISOString().slice(0, 10);
  const [dataSelecionada, setDataSelecionada] = useState<string>(() => dataInicial || getTodayStr());
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>(() => horarioInicial || '');

  // Step 4: Observações adicionais
  const [observacoesExtras, setObservacoesExtras] = useState('');

  // Lista de serviços (produtos marcados como ativos)
  const servicosDisponiveis = useMemo(() => {
    return produtos.filter((p) => p.status);
  }, [produtos]);

  const servicoSelecionado = useMemo(() => {
    return servicosDisponiveis.find((p) => p.id == servicoId);
  }, [servicosDisponiveis, servicoId]);

  // Lista de datas dos próximos 14 dias
  const proximosDias = useMemo(() => {
    const dias = [];
    const hoje = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const diaSemana = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const diaMes = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dias.push({ iso, diaSemana, diaMes, isToday: i === 0 });
    }
    return dias;
  }, []);

  // Horários ocupados na data selecionada
  const horariosOcupados = useMemo(() => {
    return agendamentos
      .filter((a) => a.dataAgendada === dataSelecionada && a.status !== 'cancelado')
      .map((a) => a.horario);
  }, [agendamentos, dataSelecionada]);

  if (!isOpen) return null;

  const mascaraWhatsapp = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!servicoId) {
        setErros({ servicoId: 'Por favor, selecione um serviço para prosseguir.' });
        servicosContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      setErros({});
    } else if (currentStep === 2) {
      const novosErros: { [key: string]: string } = {};
      if (!petNome.trim()) {
        novosErros.petNome = 'Por favor, informe o nome do seu pet.';
      }
      if (!tutorNome.trim()) {
        novosErros.tutorNome = 'Por favor, informe o nome do tutor responsável.';
      }
      const rawWhats = tutorWhatsapp.replace(/\D/g, '');
      if (rawWhats.length < 10) {
        novosErros.tutorWhatsapp = 'Por favor, informe um WhatsApp válido com DDD.';
      }

      if (Object.keys(novosErros).length > 0) {
        setErros(novosErros);
        if (novosErros.petNome) {
          petNomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          petNomeRef.current?.focus();
        } else if (novosErros.tutorNome) {
          tutorNomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          tutorNomeRef.current?.focus();
        } else if (novosErros.tutorWhatsapp) {
          tutorWhatsappRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          tutorWhatsappRef.current?.focus();
        }
        return;
      }
      setErros({});
    } else if (currentStep === 3) {
      if (!dataSelecionada || !horarioSelecionado) {
        setErros({ horario: 'Por favor, escolha uma data e um horário disponível.' });
        horariosContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      setErros({});
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalizarAgendamento = async () => {
    if (!servicoSelecionado) return;

    const rawWhatsapp = tutorWhatsapp.replace(/\D/g, '');
    const cleanEmpresaWhats = (empresa.whatsapp || empresa.telefone || '').replace(/\D/g, '');

    const novoAgendamento = {
      dataAgendada: dataSelecionada,
      horario: horarioSelecionado,
      servicoId: servicoSelecionado.id,
      servicoNome: servicoSelecionado.nome,
      preco: servicoSelecionado.preco,
      pet: {
        nome: petNome.trim(),
        especie: petEspecie,
        porte: petPorte,
        raca: petRaca.trim() || undefined,
        idade: petIdade.trim() || undefined,
        observacoes: petObservacoes.trim() || undefined,
      },
      tutor: {
        nome: tutorNome.trim(),
        whatsapp: rawWhatsapp,
      },
      status: 'solicitado' as const,
      observacoes: observacoesExtras.trim() || undefined,
    };

    // 1. Grava no banco da loja
    await adicionarAgendamento(activeSlug || empresa.slug || '', novoAgendamento);

    // 2. Prepara mensagem formatada para o WhatsApp
    const [ano, mes, dia] = dataSelecionada.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const especieEmoji = petEspecie === 'cao' ? '🐶 Cão' : petEspecie === 'gato' ? '🐱 Gato' : petEspecie === 'ave' ? '🦜 Ave' : '🐾 Pet';

    let msg = `🐾 *NOVO AGENDAMENTO - ${empresa.nome || 'Pet Shop & Clínica'}*\n\n`;
    msg += `📋 *Serviço:* ${servicoSelecionado.nome}\n`;
    msg += `💰 *Valor Estimado:* R$ ${servicoSelecionado.preco.toFixed(2).replace('.', ',')}\n`;
    msg += `📅 *Data:* ${dataFormatada}\n`;
    msg += `⏰ *Horário:* ${horarioSelecionado}\n\n`;
    msg += `*DADOS DO PET:*\n`;
    msg += `• *Nome:* ${petNome.trim()}\n`;
    msg += `• *Espécie:* ${especieEmoji}\n`;
    msg += `• *Porte:* ${petPorte ? petPorte.toUpperCase() : 'Não informado'}\n`;
    if (petRaca.trim()) msg += `• *Raça:* ${petRaca.trim()}\n`;
    if (petIdade.trim()) msg += `• *Idade:* ${petIdade.trim()}\n`;
    if (petObservacoes.trim()) msg += `• *Cuidados do Pet:* ${petObservacoes.trim()}\n`;
    msg += `\n*TUTOR RESPONSÁVEL:*\n`;
    msg += `• *Nome:* ${tutorNome.trim()}\n`;
    msg += `• *WhatsApp:* ${tutorWhatsapp}\n`;
    if (observacoesExtras.trim()) msg += `\n📝 *Observações:* ${observacoesExtras.trim()}\n`;
    msg += `\n_Solicitado via Catálogo Express._`;

    // 3. Abre WhatsApp se número estiver configurado
    if (cleanEmpresaWhats) {
      const waUrl = `https://wa.me/55${cleanEmpresaWhats}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    }

    setSucesso(true);
  };

  const handleResetModal = () => {
    setSucesso(false);
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#161E2E] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#283449] overflow-hidden my-auto transition-all">
        
        {/* Header do Modal */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-teal-700 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">
              🐾
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                Agendar Horário / Consulta
              </h3>
              <p className="text-xs text-teal-100 font-medium">
                {empresa.nome || 'Pet Shop & Clínica Veterinária'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        {!sucesso && (
          <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-slate-100 dark:border-[#283449] bg-slate-50/70 dark:bg-[#1A2234]">
            <div className="grid grid-cols-4 gap-2">
              {[
                { step: 1, label: 'Serviço', icon: Scissors },
                { step: 2, label: 'Pet & Tutor', icon: Heart },
                { step: 3, label: 'Data & Hora', icon: Calendar },
                { step: 4, label: 'Confirmação', icon: CheckCircle2 },
              ].map(({ step, label, icon: Icon }) => {
                const isActive = currentStep === step;
                const isPassed = currentStep > step;
                return (
                  <div key={step} className="flex flex-col items-center text-center gap-1">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isActive
                          ? 'bg-teal-700 text-white ring-4 ring-teal-100 dark:ring-teal-900/60 shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold truncate ${
                        isActive
                          ? 'text-teal-700 dark:text-teal-400 font-bold'
                          : isPassed
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Conteúdo dos Passos */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          {sucesso ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-sm">
                🎉
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Solicitação Enviada com Sucesso!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  O agendamento de <strong>{petNome}</strong> para <strong>{servicoSelecionado?.nome}</strong> foi registrado e encaminhado para o WhatsApp da equipe.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#1A2234] rounded-2xl border border-slate-200 dark:border-[#283449] max-w-sm mx-auto text-left text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <p className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Data & Horário:</span>
                  <strong className="text-teal-700 dark:text-teal-400">{dataSelecionada.split('-').reverse().join('/')} às {horarioSelecionado}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Pet:</span>
                  <strong>{petNome} ({petEspecie})</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Tutor:</span>
                  <strong>{tutorNome}</strong>
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleResetModal}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer"
                >
                  Concluir e Voltar à Loja
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Escolha do Serviço */}
              {currentStep === 1 && (
                <div ref={servicosContainerRef} className="space-y-4 animate-fade-in">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                      <span>Selecione o Serviço Desejado</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Escolha o procedimento de estética ou atendimento veterinário para o seu pet.
                    </p>
                  </div>

                  {erros.servicoId && (
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{erros.servicoId}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {servicosDisponiveis.map((servico) => {
                      const isSelected = servicoId == servico.id;
                      return (
                        <div
                          key={servico.id}
                          onClick={() => {
                            setServicoId(servico.id);
                            if (erros.servicoId) setErros((prev) => ({ ...prev, servicoId: '' }));
                          }}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'border-teal-700 bg-teal-50/60 dark:bg-teal-950/30 dark:border-teal-500 shadow-sm'
                              : 'border-slate-200 dark:border-[#283449] hover:border-teal-300 dark:hover:border-teal-700 bg-white dark:bg-[#1A2234]'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                                {servico.nome}
                              </h5>
                              <span className="text-sm font-black text-teal-800 dark:text-teal-300 whitespace-nowrap">
                                R$ {servico.preco.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            {servico.descricao && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {servico.descricao}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-[#283449]/60">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              {servico.duracao_estimada || '45 min'}
                            </span>
                            <span className={`font-bold ${isSelected ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
                              {isSelected ? '✓ Selecionado' : 'Selecionar'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Dados do Pet e Tutor */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                      <span>Quem é o Paciente de 4 Patas?</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Informações importantes para prepararmos o melhor acolhimento.
                    </p>
                  </div>

                  {/* Espécie */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Espécie do Animal *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'cao', label: 'Cão', icon: '🐶' },
                        { id: 'gato', label: 'Gato', icon: '🐱' },
                        { id: 'ave', label: 'Ave', icon: '🦜' },
                        { id: 'outro', label: 'Outro', icon: '🐾' },
                      ].map((esp) => (
                        <button
                          key={esp.id}
                          type="button"
                          onClick={() => setPetEspecie(esp.id as any)}
                          className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            petEspecie === esp.id
                              ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                              : 'border-slate-200 dark:border-[#283449] bg-white dark:bg-[#1A2234] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{esp.icon}</span>
                          <span>{esp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Nome do Pet *
                        </label>
                        {erros.petNome && (
                          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {erros.petNome}
                          </span>
                        )}
                      </div>
                      <input
                        ref={petNomeRef}
                        type="text"
                        placeholder="Ex: Thor, Mel, Bob..."
                        value={petNome}
                        onChange={(e) => {
                          setPetNome(e.target.value);
                          if (erros.petNome) setErros((prev) => ({ ...prev, petNome: '' }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                          erros.petNome
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Porte do Pet
                      </label>
                      <select
                        value={petPorte}
                        onChange={(e) => setPetPorte(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="pequeno">Porte Pequeno (até 10kg)</option>
                        <option value="medio">Porte Médio (11 a 20kg)</option>
                        <option value="grande">Porte Grande (acima de 20kg)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Raça (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Shih Tzu, Golden, SRD..."
                        value={petRaca}
                        onChange={(e) => setPetRaca(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Idade (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 2 anos, 6 meses..."
                        value={petIdade}
                        onChange={(e) => setPetIdade(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Observações ou Cuidados Especiais do Pet
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Alérgico a determinados xampus, não gosta de secador forte, dócil..."
                      value={petObservacoes}
                      onChange={(e) => setPetObservacoes(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>

                  {/* Dados do Tutor */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#283449] space-y-3">
                    <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      <span>Dados do Tutor Responsável</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Nome do Tutor *
                          </label>
                          {erros.tutorNome && (
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {erros.tutorNome}
                            </span>
                          )}
                        </div>
                        <input
                          ref={tutorNomeRef}
                          type="text"
                          placeholder="Seu nome completo"
                          value={tutorNome}
                          onChange={(e) => {
                            setTutorNome(e.target.value);
                            if (erros.tutorNome) setErros((prev) => ({ ...prev, tutorNome: '' }));
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                            erros.tutorNome
                              ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white'
                              : 'bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            WhatsApp de Contato *
                          </label>
                          {erros.tutorWhatsapp && (
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {erros.tutorWhatsapp}
                            </span>
                          )}
                        </div>
                        <input
                          ref={tutorWhatsappRef}
                          type="tel"
                          placeholder="(11) 98888-7777"
                          value={tutorWhatsapp}
                          onChange={(e) => {
                            setTutorWhatsapp(mascaraWhatsapp(e.target.value));
                            if (erros.tutorWhatsapp) setErros((prev) => ({ ...prev, tutorWhatsapp: '' }));
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                            erros.tutorWhatsapp
                              ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white'
                              : 'bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Escolha de Data e Grade de Horários */}
              {currentStep === 3 && (
                <div ref={horariosContainerRef} className="space-y-5 animate-fade-in">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-teal-700 dark:text-white" />
                      <span>Escolha a Data e o Horário</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Veja os horários livres e selecione o melhor momento para o atendimento.
                    </p>
                  </div>

                  {erros.horario && (
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{erros.horario}</span>
                    </div>
                  )}

                  {/* Carrossel de Datas dos Próximos Dias */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Data do Atendimento
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {proximosDias.map((d) => {
                        const isSelected = dataSelecionada === d.iso;
                        return (
                          <button
                            key={d.iso}
                            type="button"
                            onClick={() => {
                              setDataSelecionada(d.iso);
                              setHorarioSelecionado('');
                              if (erros.horario) setErros((prev) => ({ ...prev, horario: '' }));
                            }}
                            className={`flex flex-col items-center justify-center p-2.5 min-w-[70px] rounded-2xl border transition-all cursor-pointer flex-shrink-0 ${
                              isSelected
                                ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                                : 'border-slate-200 dark:border-[#283449] bg-white dark:bg-[#1A2234] text-slate-700 dark:text-slate-300 hover:border-teal-300'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                              {d.isToday ? 'Hoje' : d.diaSemana}
                            </span>
                            <span className="text-xs font-black">{d.diaMes}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grade de Horários Livres / Ocupados */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Horários para {dataSelecionada.split('-').reverse().join('/')}:
                      </label>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Disponível
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Ocupado
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {HORARIOS_PADRAO.map((hr) => {
                        const isOcupado = horariosOcupados.includes(hr);
                        const isSelected = horarioSelecionado === hr;
                        return (
                          <button
                            key={hr}
                            type="button"
                            disabled={isOcupado}
                            onClick={() => {
                              setHorarioSelecionado(hr);
                              if (erros.horario) setErros((prev) => ({ ...prev, horario: '' }));
                            }}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isOcupado
                                ? 'bg-slate-100 dark:bg-[#121824] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed line-through'
                                : isSelected
                                ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                                : 'border-slate-200 dark:border-[#283449] bg-white dark:bg-[#1A2234] text-slate-700 dark:text-slate-300 hover:border-teal-500 cursor-pointer'
                            }`}
                          >
                            <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : isOcupado ? 'text-slate-400' : 'text-emerald-500'}`} />
                            <span>{hr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Revisão e Confirmação */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                      <span>Revise os Dados do Agendamento</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Confira todos os detalhes antes de enviar para a clínica.
                    </p>
                  </div>

                  <div className="p-4 bg-teal-50/70 dark:bg-[#1A2234] rounded-2xl border border-teal-200/80 dark:border-[#283449] space-y-3">
                    <div className="flex items-start justify-between border-b border-teal-200/60 dark:border-[#283449] pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                          Serviço Selecionado
                        </span>
                        <h5 className="font-black text-sm text-slate-900 dark:text-white">
                          {servicoSelecionado?.nome}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Duração média estimada: {servicoSelecionado?.duracao_estimada || '45 min'}
                        </p>
                      </div>
                      <span className="text-base font-black text-teal-800 dark:text-teal-300">
                        R$ {servicoSelecionado?.preco.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">
                          Data & Horário:
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {dataSelecionada.split('-').reverse().join('/')} às {horarioSelecionado}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">
                          Pet & Porte:
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {petNome} ({petEspecie}) · {petPorte}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">
                          Tutor Responsável:
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {tutorNome}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">
                          WhatsApp de Contato:
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {tutorWhatsapp}
                        </strong>
                      </div>
                    </div>

                    {petObservacoes && (
                      <div className="pt-2 border-t border-teal-200/40 dark:border-[#283449] text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">
                          Cuidados do Pet:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 italic">{petObservacoes}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Alguma instrução adicional para a equipe? (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Preciso de táxi dog, animal toma medicação..."
                      value={observacoesExtras}
                      onChange={(e) => setObservacoesExtras(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Botões de Ação do Wizard */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-[#283449]">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span>Próximo Passo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalizarAgendamento}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirmar & Enviar no WhatsApp</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

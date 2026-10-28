import React, { useState, useMemo, useRef } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Agendamento, AgendamentoStatus, PetInfo } from '../../types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  Plus,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Heart,
  ChevronRight,
  Filter,
  Check,
  Send,
  CalendarDays,
  Activity,
  Scissors,
  Sparkles,
  Inbox,
  RotateCcw,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { buildPetAgendamentoCalendarUrl, downloadIcsFile } from '../../utils/googleCalendar';
import { toast } from '../ui/Toast';

type FiltroPeriodo = 'hoje' | '7dias' | 'mes' | 'todos';

export const AgendamentosView: React.FC = () => {
  const {
    agendamentos,
    adicionarAgendamento,
    atualizarStatusAgendamento,
    cancelarAgendamento,
    excluirAgendamento,
    limparTodosAgendamentos,
    activeSlug,
    setActiveView,
    empresa,
    produtos,
    isDarkMode,
  } = useCatalog();

  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('hoje');
  const [busca, setBusca] = useState('');
  const [modalNovoAberto, setModalNovoAberto] = useState(false);

  // Estados para novo agendamento manual
  const [novoServicoId, setNovoServicoId] = useState<number | string>('');
  const [novoPetNome, setNovoPetNome] = useState('');
  const [novoPetEspecie, setNovoPetEspecie] = useState<PetInfo['especie']>('cao');
  const [novoPetPorte, setNovoPetPorte] = useState<PetInfo['porte']>('pequeno');
  const [novoPetRaca, setNovoPetRaca] = useState('');
  const [novoTutorNome, setNovoTutorNome] = useState('');
  const [novoTutorWhatsapp, setNovoTutorWhatsapp] = useState('');
  const [novaData, setNovaData] = useState(() => new Date().toISOString().slice(0, 10));
  const [novoHorario, setNovoHorario] = useState('10:00');
  const [novasObs, setNovasObs] = useState('');
  const [manualErros, setManualErros] = useState<{ [key: string]: string }>({});

  const manualPetNomeRef = useRef<HTMLInputElement>(null);
  const manualTutorNomeRef = useRef<HTMLInputElement>(null);

  const handleExcluir = async (agendamento: Agendamento) => {
    if (window.confirm(`Deseja excluir permanentemente o agendamento de ${agendamento.pet.nome}?`)) {
      await excluirAgendamento(activeSlug, agendamento.id);
      toast.success('Agendamento excluído.');
    }
  };

  const handleLimparTodos = async () => {
    if (window.confirm('Deseja realmente limpar todos os agendamentos da esteira?')) {
      await limparTodosAgendamentos(activeSlug);
      toast.success('Esteira de agendamentos limpa com sucesso!');
    }
  };

  const getTodayStr = () => new Date().toISOString().slice(0, 10);

  // Filtragem por período
  const agendamentosFiltradosPorData = useMemo(() => {
    const hojeStr = getTodayStr();
    const hojeDate = new Date();

    return agendamentos.filter((a) => {
      if (filtroPeriodo === 'hoje') {
        return a.dataAgendada === hojeStr;
      }
      if (filtroPeriodo === '7dias') {
        const d = new Date(a.dataAgendada + 'T00:00:00');
        const diffDays = (d.getTime() - hojeDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 7;
      }
      if (filtroPeriodo === 'mes') {
        const [ano, mes] = a.dataAgendada.split('-');
        return (
          Number(ano) === hojeDate.getFullYear() &&
          Number(mes) === hojeDate.getMonth() + 1
        );
      }
      return true;
    });
  }, [agendamentos, filtroPeriodo]);

  // Filtragem por busca
  const agendamentosExibidos = useMemo(() => {
    if (!busca.trim()) return agendamentosFiltradosPorData;
    const q = busca.toLowerCase();
    return agendamentosFiltradosPorData.filter(
      (a) =>
        a.pet.nome.toLowerCase().includes(q) ||
        a.tutor.nome.toLowerCase().includes(q) ||
        a.servicoNome.toLowerCase().includes(q) ||
        (a.pet.raca && a.pet.raca.toLowerCase().includes(q)) ||
        a.tutor.whatsapp.includes(q)
    );
  }, [agendamentosFiltradosPorData, busca]);

  // Colunas da Esteira Kanban
  const solicitados = agendamentosExibidos.filter((a) => a.status === 'solicitado');
  const confirmados = agendamentosExibidos.filter((a) => a.status === 'confirmado');
  const emAtendimento = agendamentosExibidos.filter((a) => a.status === 'em_atendimento');
  const concluidos = agendamentosExibidos.filter((a) => a.status === 'concluido');
  const cancelados = agendamentosExibidos.filter((a) => a.status === 'cancelado');

  // Métricas
  const totalHoje = agendamentos.filter((a) => a.dataAgendada === getTodayStr() && a.status !== 'cancelado').length;
  const totalPendentes = agendamentos.filter((a) => a.status === 'solicitado').length;
  const totalConfirmados = agendamentos.filter((a) => a.status === 'confirmado').length;

  const handleMudarStatus = (agendamento: Agendamento, novoStatus: AgendamentoStatus) => {
    atualizarStatusAgendamento(activeSlug || '', agendamento.id, novoStatus);
  };

  const handleSalvarManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const servico = produtos.find((p) => p.id == novoServicoId) || produtos[0];
    const errs: { [key: string]: string } = {};

    if (!servico) {
      errs.servico = 'Por favor, selecione um serviço.';
    }
    if (!novoPetNome.trim()) {
      errs.petNome = 'Por favor, informe o nome do pet.';
    }
    if (!novoTutorNome.trim()) {
      errs.tutorNome = 'Por favor, informe o tutor responsável.';
    }

    if (Object.keys(errs).length > 0) {
      setManualErros(errs);
      if (errs.petNome) {
        manualPetNomeRef.current?.focus();
      } else if (errs.tutorNome) {
        manualTutorNomeRef.current?.focus();
      }
      return;
    }
    setManualErros({});

    const gCalUrl = buildPetAgendamentoCalendarUrl({
      servicoNome: servico.nome,
      petNome: novoPetNome.trim(),
      petEspecie: novoPetEspecie,
      petPorte: novoPetPorte,
      tutorNome: novoTutorNome.trim(),
      tutorTelefone: novoTutorWhatsapp.replace(/\D/g, ''),
      dataAgendada: novaData,
      horario: novoHorario,
      empresaNome: empresa.nome || 'Pet Shop',
      ownerEmail: empresa.emailGoogleAgenda || empresa.email || '',
      valorTotal: servico.preco,
    });

    await adicionarAgendamento(activeSlug || '', {
      dataAgendada: novaData,
      horario: novoHorario,
      servicoId: servico.id,
      servicoNome: servico.nome,
      preco: servico.preco,
      pet: {
        nome: novoPetNome.trim(),
        especie: novoPetEspecie,
        porte: novoPetPorte,
        raca: novoPetRaca.trim() || undefined,
      },
      tutor: {
        nome: novoTutorNome.trim(),
        whatsapp: novoTutorWhatsapp.replace(/\D/g, ''),
      },
      status: 'confirmado',
      googleCalendarUrl: gCalUrl,
      observacoes: novasObs.trim() || undefined,
    });

    setModalNovoAberto(false);
    // Limpa form
    setNovoPetNome('');
    setNovoTutorNome('');
    setNovoTutorWhatsapp('');
    setNovasObs('');
  };

  const enviarWhatsappLembrete = (a: Agendamento) => {
    const rawNumber = a.tutor.whatsapp.replace(/\D/g, '');
    const [ano, mes, dia] = a.dataAgendada.split('-');
    const msg = `Olá, *${a.tutor.nome}*! Tudo bem?\n\nPassando para confirmar o agendamento de *${a.pet.nome}* para *${a.servicoNome}* no dia *${dia}/${mes}/${ano}* às *${a.horario}* na *${empresa.nome || 'nossa clínica'}*.\n\nQualquer dúvida estamos à disposição! 🐾`;
    window.open(`https://wa.me/55${rawNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-white pb-16 transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#161E2E]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#283449] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('admin')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Voltar ao Painel Admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🐾</span>
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  Esteira de Agendamentos & Consultas
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {empresa.nome || 'Pet Shop & Clínica Veterinária'} · Gestão operacional diária
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {agendamentos.length > 0 && (
              <button
                type="button"
                onClick={handleLimparTodos}
                className="px-3.5 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                title="Limpar todos os agendamentos da esteira"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span className="hidden sm:inline">Limpar Esteira ({agendamentos.length})</span>
                <span className="sm:hidden">Limpar ({agendamentos.length})</span>
              </button>
            )}

            <button
              onClick={() => setModalNovoAberto(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#161E2E] p-4 rounded-2xl border border-slate-200 dark:border-[#283449] shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-white" />
              <span>Atendimentos Hoje</span>
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalHoje}</p>
          </div>

          <div className="bg-white dark:bg-[#161E2E] p-4 rounded-2xl border border-slate-200 dark:border-[#283449] shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Inbox className="w-3.5 h-3.5" />
              <span>Aguardando Confirmação</span>
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalPendentes}</p>
          </div>

          <div className="bg-white dark:bg-[#161E2E] p-4 rounded-2xl border border-slate-200 dark:border-[#283449] shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmados</span>
            </span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalConfirmados}</p>
          </div>

          <div className="bg-white dark:bg-[#161E2E] p-4 rounded-2xl border border-slate-200 dark:border-[#283449] shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Total no Período</span>
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {agendamentosFiltradosPorData.filter((a) => a.status !== 'cancelado').length}
            </p>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#161E2E] p-3 rounded-2xl border border-slate-200 dark:border-[#283449] shadow-2xs">
          
          {/* Tabs de Período */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'hoje', label: 'Hoje' },
              { id: '7dias', label: 'Próximos 7 Dias' },
              { id: 'mes', label: 'Este Mês' },
              { id: 'todos', label: 'Todos' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFiltroPeriodo(p.id as FiltroPeriodo)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filtroPeriodo === p.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Campo de Busca */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por pet, tutor ou serviço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Banner de Sincronização com Google Agenda do Dono */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 p-3.5 rounded-2xl border border-teal-200/80 dark:border-teal-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Google Agenda do Dono
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-[10px] uppercase">
                  Sincronização 1-Clique Ativa
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {empresa.emailGoogleAgenda
                  ? `Vinculado ao e-mail: ${empresa.emailGoogleAgenda} — Novos agendamentos geram convites e links diretos para sua agenda.`
                  : 'Configure o e-mail do seu Google Calendar em Empresa para receber convites automáticos.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#333] hover:border-teal-400 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>Abrir Meu Google Agenda</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* ESTEIRA KANBAN DE AGENDAMENTOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          
          {/* Coluna 1: Solicitados */}
          <div className="bg-slate-100/70 dark:bg-[#121824] p-3 rounded-2xl border border-slate-200 dark:border-[#283449] space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Solicitados</span>
              </span>
              <span className="text-xs font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                {solicitados.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[150px]">
              {solicitados.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  Nenhum agendamento pendente
                </div>
              ) : (
                solicitados.map((a) => (
                  <CardAgendamento
                    key={a.id}
                    agendamento={a}
                    empresa={empresa}
                    onAvancar={() => handleMudarStatus(a, 'confirmado')}
                    onCancelar={() => handleMudarStatus(a, 'cancelado')}
                    onExcluir={() => handleExcluir(a)}
                    onWhatsApp={() => enviarWhatsappLembrete(a)}
                    proximoLabel="Confirmar"
                  />
                ))
              )}
            </div>
          </div>

          {/* Coluna 2: Confirmados */}
          <div className="bg-slate-100/70 dark:bg-[#121824] p-3 rounded-2xl border border-slate-200 dark:border-[#283449] space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Confirmados</span>
              </span>
              <span className="text-xs font-black bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {confirmados.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[150px]">
              {confirmados.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  Nenhum agendamento confirmado
                </div>
              ) : (
                confirmados.map((a) => (
                  <CardAgendamento
                    key={a.id}
                    agendamento={a}
                    empresa={empresa}
                    onAvancar={() => handleMudarStatus(a, 'em_atendimento')}
                    onVoltar={() => handleMudarStatus(a, 'solicitado')}
                    onCancelar={() => handleMudarStatus(a, 'cancelado')}
                    onExcluir={() => handleExcluir(a)}
                    onWhatsApp={() => enviarWhatsappLembrete(a)}
                    proximoLabel="Iniciar Atendimento"
                  />
                ))
              )}
            </div>
          </div>

          {/* Coluna 3: Em Atendimento */}
          <div className="bg-slate-100/70 dark:bg-[#121824] p-3 rounded-2xl border border-slate-200 dark:border-[#283449] space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Em Atendimento</span>
              </span>
              <span className="text-xs font-black bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full">
                {emAtendimento.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[150px]">
              {emAtendimento.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  Nenhum pet em atendimento agora
                </div>
              ) : (
                emAtendimento.map((a) => (
                  <CardAgendamento
                    key={a.id}
                    agendamento={a}
                    empresa={empresa}
                    onAvancar={() => handleMudarStatus(a, 'concluido')}
                    onVoltar={() => handleMudarStatus(a, 'confirmado')}
                    onCancelar={() => handleMudarStatus(a, 'cancelado')}
                    onExcluir={() => handleExcluir(a)}
                    onWhatsApp={() => enviarWhatsappLembrete(a)}
                    proximoLabel="Concluir Atendimento"
                  />
                ))
              )}
            </div>
          </div>

          {/* Coluna 4: Concluídos */}
          <div className="bg-slate-100/70 dark:bg-[#121824] p-3 rounded-2xl border border-slate-200 dark:border-[#283449] space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Concluídos</span>
              </span>
              <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {concluidos.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[150px]">
              {concluidos.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  Nenhum atendimento concluído
                </div>
              ) : (
                concluidos.map((a) => (
                  <CardAgendamento
                    key={a.id}
                    agendamento={a}
                    empresa={empresa}
                    onVoltar={() => handleMudarStatus(a, 'em_atendimento')}
                    onExcluir={() => handleExcluir(a)}
                    onWhatsApp={() => enviarWhatsappLembrete(a)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Seção de Agendamentos Cancelados (se houver) */}
        {cancelados.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-[#283449]">
            <details className="group">
              <summary className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#121824] text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                <span>Agendamentos Cancelados ({cancelados.length})</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                {cancelados.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#161E2E] border border-red-200 dark:border-red-950/60 opacity-70 text-xs space-y-1"
                  >
                    <p className="font-bold text-slate-800 dark:text-slate-200 line-through">
                      {a.pet.nome} · {a.servicoNome}
                    </p>
                    <p className="text-slate-500">{a.dataAgendada} às {a.horario}</p>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleMudarStatus(a, 'solicitado')}
                        className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                      >
                        Reativar Agendamento
                      </button>
                      <button
                        onClick={() => handleExcluir(a)}
                        className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </main>

      {/* MODAL: Novo Agendamento Manual */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#161E2E] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#283449] overflow-hidden my-auto">
            <div className="p-4 bg-teal-700 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Novo Agendamento Manual</span>
              </h3>
              <button
                onClick={() => setModalNovoAberto(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarManual} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Serviço *</label>
                  {manualErros.servico && (
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {manualErros.servico}
                    </span>
                  )}
                </div>
                <select
                  value={novoServicoId}
                  onChange={(e) => {
                    setNovoServicoId(e.target.value);
                    if (manualErros.servico) setManualErros((prev) => ({ ...prev, servico: '' }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-slate-900 dark:text-white transition-all ${
                    manualErros.servico
                      ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                      : 'bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449]'
                  }`}
                >
                  <option value="">Selecione um serviço...</option>
                  {produtos.filter((p) => p.status).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} - R$ {p.preco.toFixed(2).replace('.', ',')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Data *</label>
                  <input
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449] rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Horário *</label>
                  <input
                    type="time"
                    value={novoHorario}
                    onChange={(e) => setNovoHorario(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449] rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Nome do Pet *</label>
                    {manualErros.petNome && (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {manualErros.petNome}
                      </span>
                    )}
                  </div>
                  <input
                    ref={manualPetNomeRef}
                    type="text"
                    placeholder="Ex: Rex"
                    value={novoPetNome}
                    onChange={(e) => {
                      setNovoPetNome(e.target.value);
                      if (manualErros.petNome) setManualErros((prev) => ({ ...prev, petNome: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-slate-900 dark:text-white transition-all ${
                      manualErros.petNome
                        ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                        : 'bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449]'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Espécie</label>
                  <select
                    value={novoPetEspecie}
                    onChange={(e) => setNovoPetEspecie(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449] rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="cao">Cão 🐶</option>
                    <option value="gato">Gato 🐱</option>
                    <option value="ave">Ave 🦜</option>
                    <option value="outro">Outro 🐾</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Porte</label>
                  <select
                    value={novoPetPorte}
                    onChange={(e) => setNovoPetPorte(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449] rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="pequeno">Pequeno (até 10kg)</option>
                    <option value="medio">Médio (11 a 20kg)</option>
                    <option value="grande">Grande (+20kg)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Raça</label>
                  <input
                    type="text"
                    placeholder="Ex: Poodle"
                    value={novoPetRaca}
                    onChange={(e) => setNovoPetRaca(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449] rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Tutor Responsável *</label>
                    {manualErros.tutorNome && (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {manualErros.tutorNome}
                      </span>
                    )}
                  </div>
                  <input
                    ref={manualTutorNomeRef}
                    type="text"
                    placeholder="Nome do cliente"
                    value={novoTutorNome}
                    onChange={(e) => {
                      setNovoTutorNome(e.target.value);
                      if (manualErros.tutorNome) setManualErros((prev) => ({ ...prev, tutorNome: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-slate-900 dark:text-white transition-all ${
                      manualErros.tutorNome
                        ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                        : 'bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449]'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={novoTutorWhatsapp}
                    onChange={(e) => setNovoTutorWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#283449] rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#283449]">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-extrabold cursor-pointer"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface CardAgendamentoProps {
  agendamento: Agendamento;
  empresa: any;
  onAvancar?: () => void;
  onVoltar?: () => void;
  onCancelar?: () => void;
  onExcluir?: () => void;
  onWhatsApp: () => void;
  proximoLabel?: string;
}

const CardAgendamento: React.FC<CardAgendamentoProps> = ({
  agendamento,
  empresa,
  onAvancar,
  onVoltar,
  onCancelar,
  onExcluir,
  onWhatsApp,
  proximoLabel,
}) => {
  const [ano, mes, dia] = agendamento.dataAgendada.split('-');
  const dataFmt = `${dia}/${mes}`;

  const especieEmoji =
    agendamento.pet.especie === 'cao'
      ? '🐶'
      : agendamento.pet.especie === 'gato'
      ? '🐱'
      : agendamento.pet.especie === 'ave'
      ? '🦜'
      : '🐾';

  const gCalUrl =
    agendamento.googleCalendarUrl ||
    buildPetAgendamentoCalendarUrl({
      servicoNome: agendamento.servicoNome,
      petNome: agendamento.pet.nome,
      petEspecie: agendamento.pet.especie,
      petPorte: agendamento.pet.porte,
      petObs: agendamento.pet.observacoes || agendamento.observacoes,
      tutorNome: agendamento.tutor.nome,
      tutorTelefone: agendamento.tutor.whatsapp,
      dataAgendada: agendamento.dataAgendada,
      horario: agendamento.horario,
      empresaNome: empresa?.nome || 'Pet Shop',
      ownerEmail: empresa?.emailGoogleAgenda || empresa?.email || '',
      valorTotal: agendamento.preco,
    });

  return (
    <div className="p-3.5 bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-[#283449] shadow-xs hover:shadow-sm transition-all space-y-2.5">
      
      {/* Topo do Card: Horário & Data */}
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-extrabold text-xs flex items-center gap-1 border border-teal-200 dark:border-teal-800/60">
          <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{agendamento.horario}</span>
          <span className="opacity-60">·</span>
          <span>{dataFmt}</span>
        </span>

        <span className="font-black text-xs text-slate-800 dark:text-slate-200">
          R$ {agendamento.preco.toFixed(2).replace('.', ',')}
        </span>
      </div>

      {/* Dados do Pet */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{especieEmoji}</span>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
            {agendamento.pet.nome}
          </h4>
          {agendamento.pet.porte && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
              {agendamento.pet.porte.toUpperCase()}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">
          {agendamento.servicoNome} {agendamento.pet.raca ? `· ${agendamento.pet.raca}` : ''}
        </p>
      </div>

      {/* Tutor e WhatsApp */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-[#283449]/70">
        <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[120px]">
          👤 {agendamento.tutor.nome}
        </span>
        <button
          onClick={onWhatsApp}
          className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          title="Chamar tutor no WhatsApp"
        >
          <Phone className="w-3 h-3" />
          <span>WhatsApp</span>
        </button>
      </div>

      {/* Sincronização Google Agenda do Dono */}
      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 dark:border-[#283449]/70">
        <a
          href={gCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 dark:text-teal-300 hover:text-teal-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800/60 transition-all hover:shadow-2xs"
          title="Salvar este evento diretamente no Google Agenda do dono"
        >
          <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Google Agenda</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>

        <button
          type="button"
          onClick={() =>
            downloadIcsFile(
              {
                title: `🐾 ${agendamento.servicoNome} - ${agendamento.pet.nome}`,
                startDate: agendamento.dataAgendada,
                startTime: agendamento.horario,
                details: `Pet: ${agendamento.pet.nome}\nTutor: ${agendamento.tutor.nome} (${agendamento.tutor.whatsapp})\nServiço: ${agendamento.servicoNome}`,
                location: empresa?.endereco || '',
                ownerEmail: empresa?.emailGoogleAgenda || empresa?.email,
              },
              `agendamento-${agendamento.pet.nome.toLowerCase().replace(/\s+/g, '-')}.ics`
            )
          }
          className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-semibold"
          title="Baixar arquivo de calendário universal .ics"
        >
          Baixar .ICS
        </button>
      </div>

      {/* Observações especiais se houver */}
      {(agendamento.pet.observacoes || agendamento.observacoes) && (
        <div className="p-2 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-[10px] text-amber-800 dark:text-amber-300">
          ⚠️ {agendamento.pet.observacoes || agendamento.observacoes}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 dark:border-[#283449]/70">
        <div className="flex items-center gap-1">
          {onVoltar && (
            <button
              onClick={onVoltar}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
              title="Voltar etapa anterior"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {onCancelar && (
            <button
              onClick={onCancelar}
              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-400 transition-all cursor-pointer"
              title="Cancelar agendamento"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {onExcluir && (
            <button
              onClick={onExcluir}
              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 transition-all cursor-pointer"
              title="Excluir agendamento permanentemente"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {onAvancar && (
          <button
            onClick={onAvancar}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 ml-auto"
          >
            <span>{proximoLabel || 'Avançar'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

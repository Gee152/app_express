import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Calendar, Clock, X, Check, CalendarCheck, Scissors, ChevronRight } from 'lucide-react';

interface GradeHorariosPublicaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHorario: (data: string, horario: string) => void;
}

const HORARIOS_PADRAO = [
  '08:30', '09:15', '10:00', '10:45', '11:30',
  '13:30', '14:15', '15:00', '15:45', '16:30', '17:15', '18:00'
];

export const GradeHorariosPublicaModal: React.FC<GradeHorariosPublicaModalProps> = ({
  isOpen,
  onClose,
  onSelectHorario,
}) => {
  const { agendamentos, empresa } = useCatalog();

  const getTodayStr = () => new Date().toISOString().slice(0, 10);
  const [dataSelecionada, setDataSelecionada] = useState<string>(getTodayStr());

  // Próximos 14 dias
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

  // Horários ocupados no dia selecionado
  const agendamentosDoDia = useMemo(() => {
    return agendamentos.filter((a) => a.dataAgendada === dataSelecionada && a.status !== 'cancelado');
  }, [agendamentos, dataSelecionada]);

  const horariosOcupados = useMemo(() => {
    return agendamentosDoDia.map((a) => a.horario);
  }, [agendamentosDoDia]);

  const totalLivres = HORARIOS_PADRAO.length - horariosOcupados.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#161E2E] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#283449] overflow-hidden my-auto transition-all">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-teal-800 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">
              🕒
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                Disponibilidade de Horários
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

        {/* Corpo da Grade */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Carrossel de Datas */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-700 dark:text-white" />
              <span>Selecione o Dia para Consultar</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {proximosDias.map((d) => {
                const isSelected = dataSelecionada === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setDataSelecionada(d.iso)}
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

          {/* Resumo do dia */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-[#283449] text-xs">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-teal-700 dark:text-white" />
              <span className="text-slate-700 dark:text-slate-300">
                Data: <strong>{dataSelecionada.split('-').reverse().join('/')}</strong>
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px]">
              {totalLivres > 0 ? `${totalLivres} horários livres` : 'Agenda lotada hoje'}
            </span>
          </div>

          {/* Grade de Slots */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Clique em um horário livre para agendar:</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Livre
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Reservado
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {HORARIOS_PADRAO.map((hr) => {
                const isOcupado = horariosOcupados.includes(hr);
                return (
                  <button
                    key={hr}
                    type="button"
                    disabled={isOcupado}
                    onClick={() => {
                      onSelectHorario(dataSelecionada, hr);
                      onClose();
                    }}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      isOcupado
                        ? 'bg-slate-100 dark:bg-[#121824] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                        : 'bg-white dark:bg-[#1A2234] border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-600 dark:hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs hover:shadow-xs group'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className={`w-3.5 h-3.5 ${isOcupado ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                      <span className="text-sm font-extrabold">{hr}</span>
                    </div>
                    <span className={`text-[10px] font-semibold ${isOcupado ? 'text-slate-400' : 'text-emerald-700 dark:text-emerald-400 group-hover:underline'}`}>
                      {isOcupado ? 'Reservado' : 'Disponível →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rodapé com botão de fechar */}
        <div className="p-4 bg-slate-50 dark:bg-[#1A2234] border-t border-slate-100 dark:border-[#283449] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

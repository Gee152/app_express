import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  AlertCircle,
  FileText,
  CalendarCheck2,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  GoogleCalendarEventOptions,
  buildGoogleCalendarUrl,
  downloadIcsFile,
  formatGoogleCalendarDates,
} from '../../utils/googleCalendar';
import { toast } from '../ui/Toast';

export interface GoogleAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  initialData: {
    title: string;
    startDate: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    durationMinutes?: number;
    details: string;
    location?: string;
    ownerEmail?: string;
    modalidade?: string;
    empresaNome?: string;
  };
}

export const GoogleAgendaModal: React.FC<GoogleAgendaModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData.title);
  const [startDate, setStartDate] = useState(initialData.startDate);
  const [startTime, setStartTime] = useState(initialData.startTime);
  const [durationMinutes, setDurationMinutes] = useState(initialData.durationMinutes || 60);
  const [location, setLocation] = useState(initialData.location || '');
  const [ownerEmail, setOwnerEmail] = useState(initialData.ownerEmail || '');
  const [details, setDetails] = useState(initialData.details);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Sincroniza estado com dados recebidos quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title);
      setStartDate(initialData.startDate);
      setStartTime(initialData.startTime);
      setDurationMinutes(initialData.durationMinutes || 60);
      setLocation(initialData.location || '');
      setOwnerEmail(initialData.ownerEmail || '');
      setDetails(initialData.details);
      setCopied(false);
      setIsSaving(false);
      setIsConfirmed(false);
    }
  }, [isOpen, initialData]);

  // Fechamento com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentOptions: GoogleCalendarEventOptions = {
    title: title.trim() || 'Agendamento / Pedido',
    startDate,
    startTime,
    durationMinutes,
    location: location.trim(),
    ownerEmail: ownerEmail.trim(),
    details: details.trim(),
  };

  // Calcula hora de término para exibição amigável
  const { endIso } = formatGoogleCalendarDates(startDate, startTime, durationMinutes);
  const formatIsoTime = (iso: string) => {
    if (!iso || iso.length < 13) return startTime;
    return `${iso.slice(9, 11)}:${iso.slice(11, 13)}`;
  };
  const endTimeStr = formatIsoTime(endIso);
  const formattedDateStr = startDate ? startDate.split('-').reverse().join('/') : '';

  // Confirmar agendamento diretamente no sistema sem abrir tela externa do Google
  const handleConfirmDirectly = async () => {
    setIsSaving(true);
    try {
      if (onConfirm) {
        await onConfirm();
      }
      onClose(); // Fecha o modal imediatamente e volta para o carrinho com todos os dados preenchidos!
    } catch (err: any) {
      // Se deu erro de validação (ex: campos pendentes), não fecha
      setIsSaving(false);
    }
  };

  const handleDownloadIcs = () => {
    try {
      downloadIcsFile(currentOptions, `agendamento-${startDate}-${startTime.replace(':', 'h')}.ics`);
      toast.success('Arquivo .ics universal baixado! Você pode importá-lo no Google, Apple ou Outlook.');
    } catch {
      toast.error('Erro ao gerar arquivo do calendário.');
    }
  };

  const handleCopyDetails = async () => {
    const textToCopy = `📅 ${title}\n🗓️ Data: ${formattedDateStr} das ${startTime} às ${endTimeStr}\n📍 Local: ${location || 'A combinar'}\n👤 E-mail Loja: ${ownerEmail || 'Não informado'}\n\n📝 Detalhes:\n${details}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Resumo do agendamento copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Não foi possível copiar os dados.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[80] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-google-calendar-title"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-all">
        {isConfirmed ? (
          /* Tela de Sucesso após Confirmação Direta */
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 mb-2">
                <Check className="w-3.5 h-3.5" /> Confirmado no Sistema
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Agendamento Confirmado!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1.5">
                O evento foi registrado na agenda do estabelecimento com sucesso, sem necessidade de telas externas.
              </p>
            </div>

            {/* Cartão Resumo */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{formattedDateStr} às {startTime} (Duração: {durationMinutes} min)</span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-medium">
                🏷️ {title}
              </div>
              {location && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>

            {/* Ações pós-confirmação */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="Salvar cópia na sua agenda pessoal"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Lembrete (.ICS)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-700/20 active:scale-95 cursor-pointer"
              >
                <span>Concluir</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Parâmetros */
          <>
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-teal-50/50 dark:bg-teal-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id="modal-google-calendar-title" className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-tight">
                      Confirmar Agendamento na Agenda
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                      Direto
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Revise os dados e confirme o agendamento diretamente no sistema.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                aria-label="Fechar modal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[72vh] overflow-y-auto">
              {/* Status do Dono da Loja */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Agenda do Dono da Loja:
                    </span>
                    {ownerEmail ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3" /> Conectado ({ownerEmail})
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        (E-mail interno da loja)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">
                    O evento será salvo e confirmado diretamente na esteira de agendamentos.
                  </p>
                </div>
              </div>

              {/* Campo: Título do Evento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Agendamento *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
                  placeholder="Ex: 🐾 [Pet Thay] Banho e Tosa - 🐶 Rex"
                />
              </div>

              {/* Grid: Data & Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Data Agendada
                  </label>
                  <div className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {formattedDateStr || 'Data não definida'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Horário & Duração Estimada
                  </label>
                  <div className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-300 flex items-center justify-between">
                    <span>{startTime} às {endTimeStr}</span>
                    <span className="text-[10px] bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded text-teal-800 dark:text-teal-200 font-semibold">
                      {durationMinutes} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Campo: Localização / Modalidade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Localização (Endereço / Modalidade)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
                  placeholder="Endereço ou Na Loja"
                />
              </div>

              {/* Campo: Detalhes / Descrição */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Detalhes do Agendamento
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyDetails}
                    className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copiado!' : 'Copiar Resumo'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all resize-y leading-relaxed"
                  placeholder="Detalhes completos do agendamento..."
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="flex-1 sm:flex-none py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Baixar arquivo universal .ics compatível com Apple Calendar, Google e Outlook"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .ICS</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDetails}
                  className="flex-1 sm:flex-none py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDirectly}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-700/20 active:scale-95 cursor-pointer"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CalendarCheck2 className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Confirmando...' : 'Confirmar Agendamento'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

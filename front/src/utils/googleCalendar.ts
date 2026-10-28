/**
 * Utilitários para integração com Google Agenda (Google Calendar)
 * Permite sincronização 1-clique via Web Intent URL e exportação padrão de arquivo .ics (iCalendar).
 */

export interface GoogleCalendarEventOptions {
  title: string;
  startDate: string; // Formato YYYY-MM-DD
  startTime: string; // Formato HH:mm
  durationMinutes?: number; // Duração estimada em minutos (padrão: 60)
  details?: string;
  location?: string;
  ownerEmail?: string;
}

/**
 * Formata as datas de início e fim no padrão aceito pelo Google Calendar (YYYYMMDDTHHmmSS).
 */
export function formatGoogleCalendarDates(
  startDate: string,
  startTime: string,
  durationMinutes = 60
): { startIso: string; endIso: string } {
  const [year, month, day] = (startDate || '').split('-').map(Number);
  const [hours, minutes] = (startTime || '09:00').split(':').map(Number);

  const start = new Date(
    year || new Date().getFullYear(),
    (month || 1) - 1,
    day || new Date().getDate(),
    hours || 9,
    minutes || 0,
    0
  );

  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const pad = (n: number) => String(n).padStart(2, '0');
  const format = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  return {
    startIso: format(start),
    endIso: format(end),
  };
}

/**
 * Constrói o link oficial do Google Calendar (Web Intent) para salvar o evento com 1 clique.
 */
export function buildGoogleCalendarUrl(options: GoogleCalendarEventOptions): string {
  const { startIso, endIso } = formatGoogleCalendarDates(
    options.startDate,
    options.startTime,
    options.durationMinutes || 60
  );

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: options.title || 'Agendamento de Serviço',
    dates: `${startIso}/${endIso}`,
    details: options.details || '',
    location: options.location || '',
  });

  if (options.ownerEmail && options.ownerEmail.includes('@')) {
    params.set('add', options.ownerEmail.trim());
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Gera e realiza o download de arquivo universal .ics (iCalendar), compatível com Google Calendar, Apple e Outlook.
 */
export function downloadIcsFile(options: GoogleCalendarEventOptions, filename = 'agendamento.ics'): void {
  const { startIso, endIso } = formatGoogleCalendarDates(
    options.startDate,
    options.startTime,
    options.durationMinutes || 60
  );

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const cleanText = (str = '') => str.replace(/\r?\n/g, '\\n').replace(/,/g, '\\,');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Catalogo Express//Agendamentos Pet//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:agendamento-${Date.now()}@catalogoexpress`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${cleanText(options.title)}`,
    `DESCRIPTION:${cleanText(options.details || '')}`,
    `LOCATION:${cleanText(options.location || '')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface PetAgendamentoData {
  servicoNome: string;
  petNome: string;
  petEspecie?: string;
  petPorte?: string;
  petObs?: string;
  tutorNome: string;
  tutorTelefone?: string;
  dataAgendada: string;
  horario: string;
  modalidade?: string;
  endereco?: string;
  empresaNome?: string;
  ownerEmail?: string;
  valorTotal?: number;
  opcoesTexto?: string;
  duracaoMinutos?: number;
}

/**
 * Extrai os parâmetros estruturados e formatados para o agendamento no Google Agenda.
 */
export function getPetAgendamentoParams(data: PetAgendamentoData): GoogleCalendarEventOptions {
  const petIcon = data.petEspecie === 'gato' ? '🐱' : data.petEspecie === 'ave' ? '🦜' : '🐶';
  const title = `🐾 [${data.empresaNome || 'Pet Shop'}] ${data.servicoNome} - ${petIcon} ${data.petNome} (Tutor: ${data.tutorNome})`;

  let details = `AGENDAMENTO DE SERVIÇO - ${data.empresaNome || 'Catálogo Express'}\n\n`;
  details += `📅 Data: ${data.dataAgendada.split('-').reverse().join('/')} às ${data.horario}\n`;
  details += `✂️ Serviço: ${data.servicoNome}\n`;
  if (data.opcoesTexto) {
    details += `✨ Combinações/Opcionais: ${data.opcoesTexto}\n`;
  }
  if (data.valorTotal) {
    details += `💰 Valor: R$ ${data.valorTotal.toFixed(2).replace('.', ',')}\n`;
  }
  details += `\n🐾 DADOS DO PET:\n`;
  details += `• Nome: ${data.petNome}\n`;
  if (data.petEspecie) details += `• Espécie: ${data.petEspecie}\n`;
  if (data.petPorte) details += `• Porte: ${data.petPorte}\n`;
  if (data.petObs) details += `• Cuidados: ${data.petObs}\n`;
  details += `\n👤 TUTOR:\n`;
  details += `• Nome: ${data.tutorNome}\n`;
  if (data.tutorTelefone) details += `• WhatsApp: ${data.tutorTelefone}\n`;
  if (data.modalidade) {
    details += `\n🚗 Modalidade: ${data.modalidade}\n`;
  }
  if (data.endereco) {
    details += `📍 Endereço: ${data.endereco}\n`;
  }

  return {
    title,
    startDate: data.dataAgendada,
    startTime: data.horario,
    durationMinutes: data.duracaoMinutos || 60,
    details,
    location: data.endereco || (data.empresaNome ? `${data.empresaNome}` : ''),
    ownerEmail: data.ownerEmail,
  };
}

/**
 * Constrói URL completa e preenchida especificamente para Agendamentos Pet e Serviços da Loja.
 */
export function buildPetAgendamentoCalendarUrl(data: PetAgendamentoData): string {
  const options = getPetAgendamentoParams(data);
  return buildGoogleCalendarUrl(options);
}

/**
 * Abre o Google Calendar em uma janela popup compacta e centralizada,
 * evitando abrir uma aba separada completa e mantendo o usuário no contexto do app.
 */
export function openGoogleCalendarPopup(url: string): Window | null {
  const width = 640;
  const height = 740;
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

  const popup = window.open(
    url,
    'GoogleCalendarPopup',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  );

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    // Fallback seguro caso o navegador bloqueie popups
    return window.open(url, '_blank');
  }

  popup.focus();
  return popup;
}


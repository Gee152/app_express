import { PlanoCliente, TipoPlano } from '../db/db';
export type { TipoPlano };

export const DIAS_PADRAO = 30;
export const DIA_MS = 86400000;

export const DIAS_PLANOS: Record<TipoPlano, number> = {
  mensal: 30,
  trimestral: 90,
  semestral: 180,
  anual: 365,
};

export const NOMES_PLANOS: Record<TipoPlano, string> = {
  mensal: 'Mensal (30 dias)',
  trimestral: 'Trimestral (90 dias)',
  semestral: 'Semestral (180 dias)',
  anual: 'Anual (365 dias)',
};

export function obterDiasPlano(tipo?: TipoPlano): number {
  if (!tipo) return 30;
  return DIAS_PLANOS[tipo] || 30;
}

export function obterNomePlano(tipo?: TipoPlano): string {
  if (!tipo) return 'Mensal (30 dias)';
  return NOMES_PLANOS[tipo] || 'Mensal (30 dias)';
}

export type StatusPlano = 'ativo' | 'expirando' | 'vencido' | 'pendente-pagamento' | 'sem-plano';

export interface PlanoStatus {
  status: StatusPlano;
  diasRestantes: number;
  dataFim: number;
  dataFimISO: string;
  ativo: boolean;
  venceEmBreve: boolean;
  vencido: boolean;
  pago: boolean;
  nomePlano: string;
}

export function calcularStatusPlano(
  plano: PlanoCliente | undefined | null,
  agora: number = Date.now()
): PlanoStatus {
  if (!plano || !plano.dias) {
    return {
      status: 'sem-plano',
      diasRestantes: 0,
      dataFim: 0,
      dataFimISO: '',
      ativo: false,
      venceEmBreve: false,
      vencido: false,
      pago: false,
      nomePlano: 'Sem plano',
    };
  }

  const isPago = plano.pago !== false;
  const nomePlano = obterNomePlano(plano.tipo);

  // Se ainda não foi pago (toggle desligado pelo Superoot)
  if (!isPago) {
    return {
      status: 'pendente-pagamento',
      diasRestantes: plano.dias,
      dataFim: 0,
      dataFimISO: '',
      ativo: false,
      venceEmBreve: false,
      vencido: false,
      pago: false,
      nomePlano,
    };
  }

  // Se foi pago, calcula a partir da data de pagamento ou do início do plano
  const inicioContagem = plano.dataPagamento || plano.inicio || agora;
  const dataFim = inicioContagem + plano.dias * DIA_MS;
  const diasRestantes = Math.ceil((dataFim - agora) / DIA_MS);
  const vencido = diasRestantes < 0;
  const venceEmBreve = !vencido && diasRestantes <= 5;

  return {
    status: vencido ? 'vencido' : venceEmBreve ? 'expirando' : 'ativo',
    diasRestantes,
    dataFim,
    dataFimISO: new Date(dataFim).toISOString(),
    ativo: !vencido,
    venceEmBreve,
    vencido,
    pago: true,
    nomePlano,
  };
}

export function formatarData(ts: number): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function rotuloStatus(plano: PlanoCliente | undefined, agora?: number): { texto: string; cor: string } {
  const s = calcularStatusPlano(plano, agora);
  switch (s.status) {
    case 'pendente-pagamento':
      return { texto: 'Aguardando Pagamento', cor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' };
    case 'vencido':
      return { texto: 'Vencido', cor: 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300' };
    case 'expirando':
      return { texto: `Vence em ${s.diasRestantes}d`, cor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300' };
    case 'ativo':
      return { texto: `Ativo · vence em ${s.diasRestantes}d`, cor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300' };
    default:
      return { texto: 'Sem plano', cor: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
  }
}
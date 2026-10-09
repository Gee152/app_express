import React, { useState } from 'react';
import { TipoPlano, DIAS_PLANOS } from '../../utils/plano';
import { Check, Sparkles, ShieldCheck, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface PlanOption {
  tipo: TipoPlano;
  nome: string;
  badge?: string;
  badgeCor?: string;
  precoEstimado: string;
  periodo: string;
  descricao: string;
  destaque?: boolean;
}

const PLANOS_DISPONIVEIS: PlanOption[] = [
  {
    tipo: 'mensal',
    nome: 'Plano Mensal',
    badge: '30 Dias',
    precoEstimado: 'R$ 49,90',
    periodo: '/mês',
    descricao: 'Ideal para validar o seu cardápio e começar a receber pedidos rapidamente.',
    destaque: false,
  },
  {
    tipo: 'trimestral',
    nome: 'Plano Trimestral',
    badge: 'Mais Popular 🔥',
    badgeCor: 'bg-emerald-500 text-white',
    precoEstimado: 'R$ 129,90',
    periodo: '/trimestre',
    descricao: '90 dias de catálogo ativo com suporte completo e estabilidade para sua operação.',
    destaque: true,
  },
  {
    tipo: 'semestral',
    nome: 'Plano Semestral',
    badge: '180 Dias',
    precoEstimado: 'R$ 239,90',
    periodo: '/semestre',
    descricao: '6 meses de loja digital garantida com excelente economia.',
    destaque: false,
  },
  {
    tipo: 'anual',
    nome: 'Plano Anual',
    badge: 'Melhor Custo-Benefício ⭐',
    badgeCor: 'bg-indigo-600 text-white',
    precoEstimado: 'R$ 419,90',
    periodo: '/ano',
    descricao: '365 dias de tranquilidade total. O maior desconto para o seu negócio crescer.',
    destaque: true,
  },
];

interface PlanSelectionStepProps {
  onConfirmPlan: (tipo: TipoPlano) => void;
  isLoading?: boolean;
  storeName?: string;
}

export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  onConfirmPlan,
  isLoading = false,
  storeName = 'sua loja',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<TipoPlano>('trimestral');

  const handleConfirm = () => {
    onConfirmPlan(selectedPlan);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-1.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Passo 2 de 2: Escolha seu Plano</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[#212529] dark:text-[#FFFFFF]">
          Qual o melhor plano para você?
        </h2>
        <p className="text-xs sm:text-sm text-[#6C757D] dark:text-[#B0BEC5] max-w-md mx-auto">
          Selecione o período de contratação para <strong className="text-indigo-600 dark:text-indigo-400">{storeName}</strong>.
          O administrador liberará seu acesso após a confirmação do pagamento.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PLANOS_DISPONIVEIS.map((plan) => {
          const isSelected = selectedPlan === plan.tipo;
          const dias = DIAS_PLANOS[plan.tipo];

          return (
            <div
              key={plan.tipo}
              onClick={() => setSelectedPlan(plan.tipo)}
              className={`relative rounded-2xl p-4 sm:p-5 border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md scale-[1.01]'
                  : 'border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-2.5 right-4 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs ${
                    plan.badgeCor || 'bg-slate-800 text-slate-100 dark:bg-slate-700'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#212529] dark:text-[#FFFFFF]">
                    {plan.nome}
                  </h3>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] leading-relaxed">
                  {plan.descricao}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-baseline justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{dias} dias de validade</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {plan.precoEstimado}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{plan.periodo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
        <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Como funciona a liberação:</strong> Ao confirmar o plano, sua loja será configurada e ficará em status de <span className="underline">Aguardando Pagamento</span>. O Superoot receberá seu pedido e ativará os {DIAS_PLANOS[selectedPlan]} dias assim que o pagamento for registrado.
        </p>
      </div>

      <button
        type="button"
        disabled={isLoading}
        onClick={handleConfirm}
        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processando Plano...</span>
          </>
        ) : (
          <>
            <span>Confirmar {PLANOS_DISPONIVEIS.find((p) => p.tipo === selectedPlan)?.nome}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

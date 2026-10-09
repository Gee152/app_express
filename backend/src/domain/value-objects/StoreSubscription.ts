export type PlanType = 'mensal' | 'trimestral' | 'semestral' | 'anual';
export type SubscriptionStatus = 'ativo' | 'expirando' | 'vencido' | 'pendente-pagamento';

export const PLAN_DAYS: Record<PlanType, number> = {
  mensal: 30,
  trimestral: 90,
  semestral: 180,
  anual: 365,
};

const DAY_IN_MS = 86_400_000;

export interface StoreSubscriptionProps {
  planType?: PlanType;
  planDays?: number;
  isPaid?: boolean;
  paidAt?: Date | null;
  expiresAt?: Date | null;
}

export interface CalculatedSubscriptionStatus {
  status: SubscriptionStatus;
  planType: PlanType;
  planDays: number;
  daysRemaining: number;
  expiresAt: Date | null;
  expiresAtISO: string | null;
  isPaid: boolean;
  isActive: boolean;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

export class StoreSubscription {
  public planType: PlanType;
  public planDays: number;
  public isPaid: boolean;
  public paidAt: Date | null;
  public expiresAt: Date | null;

  constructor(props?: StoreSubscriptionProps) {
    this.planType = props?.planType || 'mensal';
    this.planDays = props?.planDays || PLAN_DAYS[this.planType] || 30;
    this.isPaid = props?.isPaid ?? false;
    this.paidAt = props?.paidAt || null;
    this.expiresAt = props?.expiresAt || null;

    // Se estiver pago mas expiresAt não estiver definido, calcula
    if (this.isPaid && this.paidAt && !this.expiresAt) {
      this.expiresAt = new Date(this.paidAt.getTime() + this.planDays * DAY_IN_MS);
    }
  }

  public activatePayment(paidAt: Date = new Date()): void {
    this.isPaid = true;
    this.paidAt = paidAt;
    this.expiresAt = new Date(paidAt.getTime() + this.planDays * DAY_IN_MS);
  }

  public deactivatePayment(): void {
    this.isPaid = false;
    this.paidAt = null;
    this.expiresAt = null;
  }

  public changePlan(planType: PlanType): void {
    this.planType = planType;
    this.planDays = PLAN_DAYS[planType] || 30;

    // Se já estiver pago, recalcula a data de expiração a partir da data de pagamento
    if (this.isPaid && this.paidAt) {
      this.expiresAt = new Date(this.paidAt.getTime() + this.planDays * DAY_IN_MS);
    } else {
      this.expiresAt = null;
    }
  }

  public calculateStatus(now: Date = new Date()): CalculatedSubscriptionStatus {
    if (!this.isPaid || !this.paidAt || !this.expiresAt) {
      return {
        status: 'pendente-pagamento',
        planType: this.planType,
        planDays: this.planDays,
        daysRemaining: this.planDays,
        expiresAt: null,
        expiresAtISO: null,
        isPaid: false,
        isActive: false,
        isExpiringSoon: false,
        isExpired: false,
      };
    }

    const diffMs = this.expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / DAY_IN_MS);
    const isExpired = daysRemaining < 0;
    const isExpiringSoon = !isExpired && daysRemaining <= 5;

    let status: SubscriptionStatus = 'ativo';
    if (isExpired) {
      status = 'vencido';
    } else if (isExpiringSoon) {
      status = 'expirando';
    }

    return {
      status,
      planType: this.planType,
      planDays: this.planDays,
      daysRemaining: Math.max(0, daysRemaining),
      expiresAt: this.expiresAt,
      expiresAtISO: this.expiresAt.toISOString(),
      isPaid: true,
      isActive: !isExpired,
      isExpiringSoon,
      isExpired,
    };
  }
}

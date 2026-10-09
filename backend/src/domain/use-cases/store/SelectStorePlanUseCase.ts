import { IStoreRepository } from '../../repositories/IStoreRepository.js';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError.js';
import { ForbiddenError } from '../../errors/ForbiddenError.js';
import { PlanType, CalculatedSubscriptionStatus } from '../../value-objects/StoreSubscription.js';
import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';

export interface SelectStorePlanInput {
  slug: string;
  planType: PlanType;
  requesterRole: string;
  requesterStoreId?: string | null;
}

export interface SelectStorePlanOutput {
  store: Store;
  subscription: CalculatedSubscriptionStatus;
}

export class SelectStorePlanUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute({
    slug,
    planType,
    requesterRole,
    requesterStoreId,
  }: SelectStorePlanInput): Promise<SelectStorePlanOutput> {
    const sanitizedSlug = Store.sanitizeSlug(slug);
    const store = await this.storeRepository.findBySlug(sanitizedSlug);
    if (!store) {
      throw new EntityNotFoundError('Loja', slug);
    }

    // Tenant check: Apenas Superadmin ou o próprio dono da loja pode alterar o plano
    if (requesterRole !== 'superadmin' && requesterStoreId && requesterStoreId !== store.id) {
      throw new ForbiddenError('Você não tem permissão para alterar o plano desta loja.');
    }

    const subscription = store.getSubscription();
    subscription.changePlan(planType);
    store.applySubscription(subscription);

    // Mantém sincronizado com config.plano legado
    store.config = {
      ...store.config,
      plano: {
        tipo: store.planType,
        dias: store.planDays,
        pago: store.isPaid,
        dataPagamento: store.paidAt ? store.paidAt.getTime() : undefined,
        inicio: store.paidAt ? store.paidAt.getTime() : (store.config?.plano?.inicio || Date.now()),
        expiresAt: store.expiresAt ? store.expiresAt.getTime() : undefined,
        renovacoes: store.config?.plano?.renovacoes || 0,
      },
    };

    await this.storeRepository.update(store);

    return {
      store,
      subscription: subscription.calculateStatus(),
    };
  }
}

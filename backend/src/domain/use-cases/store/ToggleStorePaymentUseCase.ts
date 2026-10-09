import { IStoreRepository } from '../../repositories/IStoreRepository.js';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError.js';
import { ForbiddenError } from '../../errors/ForbiddenError.js';
import { CalculatedSubscriptionStatus } from '../../value-objects/StoreSubscription.js';
import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';

export interface ToggleStorePaymentInput {
  slug: string;
  isPaid: boolean;
  requesterRole: string;
}

export interface ToggleStorePaymentOutput {
  store: Store;
  subscription: CalculatedSubscriptionStatus;
}

export class ToggleStorePaymentUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute({ slug, isPaid, requesterRole }: ToggleStorePaymentInput): Promise<ToggleStorePaymentOutput> {
    if (requesterRole !== 'superadmin') {
      throw new ForbiddenError('Apenas o Superadmin tem permissão para confirmar ou suspender pagamentos de lojas.');
    }

    const sanitizedSlug = Store.sanitizeSlug(slug);
    const store = await this.storeRepository.findBySlug(sanitizedSlug);
    if (!store) {
      throw new EntityNotFoundError('Loja', slug);
    }

    const subscription = store.getSubscription();

    if (isPaid) {
      subscription.activatePayment(new Date());
    } else {
      subscription.deactivatePayment();
    }

    store.applySubscription(subscription);

    // Mantém compatibilidade com config.plano legado consumido pelo front
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

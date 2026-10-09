import { IStoreRepository } from '../../repositories/IStoreRepository.js';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError.js';
import { CalculatedSubscriptionStatus } from '../../value-objects/StoreSubscription.js';
import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';

export class GetStoreSubscriptionUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(slug: string): Promise<CalculatedSubscriptionStatus> {
    const sanitizedSlug = Store.sanitizeSlug(slug);
    const store = await this.storeRepository.findBySlug(sanitizedSlug);
    if (!store) {
      throw new EntityNotFoundError('Loja', slug);
    }

    const subscription = store.getSubscription();
    return subscription.calculateStatus();
  }
}

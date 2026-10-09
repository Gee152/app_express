import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';
import { IStoreRepository } from '../../repositories/IStoreRepository.js';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError.js';

export class GetStoreBySlugUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(slug: string): Promise<Store> {
    const sanitizedSlug = Store.sanitizeSlug(slug);
    const store = await this.storeRepository.findBySlug(sanitizedSlug);
    if (!store) {
      throw new EntityNotFoundError('Loja', slug);
    }
    return store;
  }
}

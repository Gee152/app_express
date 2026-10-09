import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';
import { IStoreRepository } from '../../repositories/IStoreRepository.js';

export class ListStoresUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(): Promise<Store[]> {
    return this.storeRepository.listAll();
  }
}

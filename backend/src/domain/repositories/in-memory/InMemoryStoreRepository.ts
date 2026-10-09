import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';
import { IStoreRepository } from '../IStoreRepository.js';

export class InMemoryStoreRepository implements IStoreRepository {
  public stores: Store[] = [];

  async findById(id: string): Promise<Store | null> {
    const store = this.stores.find((s) => s.id === id);
    return store || null;
  }

  async findBySlug(slug: string): Promise<Store | null> {
    const sanitizedSlug = Store.sanitizeSlug(slug);
    const store = this.stores.find((s) => s.slug === sanitizedSlug);
    return store || null;
  }

  async listAll(): Promise<Store[]> {
    return [...this.stores];
  }

  async create(store: Store): Promise<Store> {
    this.stores.push(store);
    return store;
  }

  async update(store: Store): Promise<void> {
    const index = this.stores.findIndex((s) => s.id === store.id);
    if (index !== -1) {
      this.stores[index] = store;
    }
  }

  async delete(id: string): Promise<void> {
    this.stores = this.stores.filter((s) => s.id !== id);
  }
}

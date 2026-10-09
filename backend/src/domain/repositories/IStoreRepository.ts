import { Store } from '../../infrastructure/database/typeorm/entities/Store.js';

export interface IStoreRepository {
  findById(id: string): Promise<Store | null>;
  findBySlug(slug: string): Promise<Store | null>;
  listAll(): Promise<Store[]>;
  create(store: Store): Promise<Store>;
  update(store: Store): Promise<void>;
  delete(id: string): Promise<void>;
}

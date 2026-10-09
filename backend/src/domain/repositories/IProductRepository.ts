import { Product } from '../../infrastructure/database/typeorm/entities/Product.js';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByStoreId(storeId: string): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}

import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { Store } from '../entities/Store.js';
import { IStoreRepository } from '../../../../domain/repositories/IStoreRepository.js';

export class TypeOrmStoreRepository implements IStoreRepository {
  private readonly ormRepository: Repository<Store>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Store);
  }

  async findById(id: string): Promise<Store | null> {
    return this.ormRepository.findOneBy({ id });
  }

  async findBySlug(slug: string): Promise<Store | null> {
    const sanitizedSlug = Store.sanitizeSlug(slug);
    return this.ormRepository.findOneBy({ slug: sanitizedSlug });
  }

  async listAll(): Promise<Store[]> {
    return this.ormRepository.find();
  }

  async create(store: Store): Promise<Store> {
    return this.ormRepository.save(store);
  }

  async update(store: Store): Promise<void> {
    await this.ormRepository.save(store);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}

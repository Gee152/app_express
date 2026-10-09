import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { IUserRepository, UserWithStoreData } from '../../../../domain/repositories/IUserRepository.js';

export class TypeOrmUserRepository implements IUserRepository {
  private readonly ormRepository: Repository<User>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.ormRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.ormRepository.findOneBy({ email: email.toLowerCase().trim() });
  }

  async create(user: User): Promise<User> {
    return this.ormRepository.save(user);
  }

  async update(user: User): Promise<void> {
    await this.ormRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async findAllWithStore(): Promise<UserWithStoreData[]> {
    const users = await this.ormRepository.find({
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      storeId: u.storeId,
      createdAt: u.createdAt,
      store: u.store
        ? {
            id: u.store.id,
            name: u.store.name,
            slug: u.store.slug,
            status: u.store.status,
            whatsapp: u.store.whatsapp,
          }
        : null,
    }));
  }

  async count(): Promise<number> {
    return this.ormRepository.count();
  }
}

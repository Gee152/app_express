import { User } from '../../../infrastructure/database/typeorm/entities/User.js';
import { IUserRepository, UserWithStoreData } from '../IUserRepository.js';

export class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async findAllWithStore(): Promise<UserWithStoreData[]> {
    return this.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      storeId: u.storeId,
      createdAt: u.createdAt,
      store: null,
    }));
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async update(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
  }

  async count(): Promise<number> {
    return this.users.length;
  }
}

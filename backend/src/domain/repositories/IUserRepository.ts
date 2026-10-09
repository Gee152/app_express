import { User } from '../../infrastructure/database/typeorm/entities/User.js';

export interface UserWithStoreData {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId: string | null;
  createdAt: Date;
  store?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    whatsapp?: string;
  } | null;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAllWithStore(): Promise<UserWithStoreData[]>;
  create(user: User): Promise<User>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

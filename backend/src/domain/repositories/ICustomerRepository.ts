import { Customer } from '../../infrastructure/database/typeorm/entities/Customer.js';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmailAndStore(email: string, storeId: string): Promise<Customer | null>;
  create(customer: Customer): Promise<Customer>;
  update(customer: Customer): Promise<void>;
  listByStore(storeId: string): Promise<Customer[]>;
}

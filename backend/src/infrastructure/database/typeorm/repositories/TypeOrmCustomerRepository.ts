import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { Customer } from '../entities/Customer.js';
import { ICustomerRepository } from '../../../../domain/repositories/ICustomerRepository.js';

export class TypeOrmCustomerRepository implements ICustomerRepository {
  private readonly ormRepository: Repository<Customer>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Customer);
  }

  async findById(id: string): Promise<Customer | null> {
    return this.ormRepository.findOneBy({ id });
  }

  async findByEmailAndStore(email: string, storeId: string): Promise<Customer | null> {
    return this.ormRepository.findOneBy({
      email: email.toLowerCase().trim(),
      storeId,
    });
  }

  async create(customer: Customer): Promise<Customer> {
    return this.ormRepository.save(customer);
  }

  async update(customer: Customer): Promise<void> {
    await this.ormRepository.save(customer);
  }

  async listByStore(storeId: string): Promise<Customer[]> {
    return this.ormRepository.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });
  }
}

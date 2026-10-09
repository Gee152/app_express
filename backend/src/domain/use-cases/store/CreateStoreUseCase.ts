import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';
import { IStoreRepository } from '../../repositories/IStoreRepository.js';
import { DomainError } from '../../errors/DomainError.js';
import { CreateStoreDTO } from '../../dtos/store/CreateStoreDTO.js';

export class SlugAlreadyInUseError extends DomainError {
  public readonly statusCode = 409;

  constructor(slug: string) {
    super(`A loja com slug "${slug}" já existe.`);
  }
}

export class CreateStoreUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(dto: CreateStoreDTO): Promise<Store> {
    const sanitizedSlug = Store.sanitizeSlug(dto.slug);
    const existingStore = await this.storeRepository.findBySlug(sanitizedSlug);
    if (existingStore) {
      throw new SlugAlreadyInUseError(sanitizedSlug);
    }

    const store = new Store({
      name: dto.name,
      slug: sanitizedSlug,
      whatsapp: dto.whatsapp || '',
      config: dto.config,
      status: dto.status || 'rascunho',
    });

    return await this.storeRepository.create(store);
  }
}

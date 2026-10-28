import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';
import { IStoreRepository } from '../../repositories/IStoreRepository.js';
import { IUserRepository } from '../../repositories/IUserRepository.js';
import { IHashProvider } from '../../providers/IHashProvider.js';
import { User } from '../../../infrastructure/database/typeorm/entities/User.js';
import { DomainError } from '../../errors/DomainError.js';
import { CreateStoreDTO } from '../../dtos/store/CreateStoreDTO.js';

export class SlugAlreadyInUseError extends DomainError {
  public readonly statusCode = 409;

  constructor(slug: string) {
    super(`A loja com slug "${slug}" já existe.`);
  }
}

export class CreateStoreUseCase {
  constructor(
    private readonly storeRepository: IStoreRepository,
    private readonly userRepository?: IUserRepository,
    private readonly hashProvider?: IHashProvider,
  ) {}

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

    const createdStore = await this.storeRepository.create(store);

    if (dto.config?.dono?.email && this.userRepository && this.hashProvider) {
      try {
        const donoEmail = String(dto.config.dono.email).toLowerCase().trim();
        const donoSenha = dto.config.dono.senha ? String(dto.config.dono.senha).trim() : '';
        const donoNome = dto.config.dono.nome ? String(dto.config.dono.nome).trim() : dto.name;

        const existingUser = await this.userRepository.findByEmail(donoEmail);
        if (existingUser) {
          existingUser.storeId = createdStore.id;
          if (donoNome) existingUser.name = donoNome;
          if (donoSenha && donoSenha.length >= 6) {
            const hash = await this.hashProvider.generateHash(donoSenha);
            existingUser.updatePassword(hash);
          }
          await this.userRepository.update(existingUser);
        } else if (donoSenha && donoSenha.length >= 6) {
          const hash = await this.hashProvider.generateHash(donoSenha);
          const newUser = new User({
            name: donoNome,
            email: donoEmail,
            passwordHash: hash,
            role: 'owner',
            storeId: createdStore.id,
          });
          await this.userRepository.create(newUser);
        }
      } catch (err) {
        console.warn('Aviso ao sincronizar dono na criação da loja:', err);
      }
    }

    return createdStore;
  }
}

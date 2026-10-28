import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';
import { IStoreRepository } from '../../repositories/IStoreRepository.js';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError.js';
import { IUserRepository } from '../../repositories/IUserRepository.js';
import { IHashProvider } from '../../providers/IHashProvider.js';
import { User } from '../../../infrastructure/database/typeorm/entities/User.js';

export interface UpdateStoreDTO {
  name?: string;
  whatsapp?: string;
  status?: 'rascunho' | 'publicada';
  config?: Record<string, any>;
}

export class UpdateStoreUseCase {
  constructor(
    private readonly storeRepository: IStoreRepository,
    private readonly userRepository?: IUserRepository,
    private readonly hashProvider?: IHashProvider,
  ) {}

  async execute(slug: string, data: UpdateStoreDTO): Promise<Store> {
    const sanitizedSlug = Store.sanitizeSlug(slug);
    const store = await this.storeRepository.findBySlug(sanitizedSlug);
    if (!store) {
      throw new EntityNotFoundError('Loja', slug);
    }

    if (data.name) store.name = data.name.trim();
    if (data.whatsapp !== undefined) store.whatsapp = data.whatsapp ? data.whatsapp.replace(/\D/g, '') : '';
    if (data.status) store.status = data.status;
    if (data.config) {
      const sanitizedConfig = { ...data.config };
      // Previne adulteração indevida de pagamento/validade via endpoint genérico
      if (sanitizedConfig.plano) {
        sanitizedConfig.plano = {
          ...store.config?.plano,
          ...sanitizedConfig.plano,
          pago: store.isPaid,
          dataPagamento: store.paidAt ? store.paidAt.getTime() : undefined,
          expiresAt: store.expiresAt ? store.expiresAt.getTime() : undefined,
        };
      }

      // Sincroniza usuário dono no banco de dados com senha criptografada via BCrypt
      if (sanitizedConfig.dono && sanitizedConfig.dono.email) {
        const donoEmail = String(sanitizedConfig.dono.email).toLowerCase().trim();
        const donoSenha = sanitizedConfig.dono.senha ? String(sanitizedConfig.dono.senha).trim() : '';
        const donoNome = sanitizedConfig.dono.nome ? String(sanitizedConfig.dono.nome).trim() : store.name;

        if (this.userRepository && this.hashProvider) {
          try {
            const existingUser = await this.userRepository.findByEmail(donoEmail);
            if (existingUser) {
              existingUser.storeId = store.id;
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
                storeId: store.id,
              });
              await this.userRepository.create(newUser);
            }
          } catch (userSyncErr) {
            console.warn('Aviso ao sincronizar usuário dono no banco:', userSyncErr);
          }
        }
      }

      store.config = { ...store.config, ...sanitizedConfig };
    }
    store.updatedAt = new Date();

    await this.storeRepository.update(store);
    return store;
  }
}

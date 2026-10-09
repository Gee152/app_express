import { Store } from '../../../infrastructure/database/typeorm/entities/Store.js';
import { IStoreRepository } from '../../repositories/IStoreRepository.js';
import { EntityNotFoundError } from '../../errors/EntityNotFoundError.js';

export interface UpdateStoreDTO {
  name?: string;
  whatsapp?: string;
  status?: 'rascunho' | 'publicada';
  config?: Record<string, any>;
}

export class UpdateStoreUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

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
      // Previne armazenamento de senha em texto plano dentro de config
      if (sanitizedConfig.dono && sanitizedConfig.dono.senha) {
        delete sanitizedConfig.dono.senha;
      }
      store.config = { ...store.config, ...sanitizedConfig };
    }
    store.updatedAt = new Date();

    await this.storeRepository.update(store);
    return store;
  }
}

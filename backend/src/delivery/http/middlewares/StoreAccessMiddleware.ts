import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './AuthMiddleware.js';
import { IStoreRepository } from '../../../domain/repositories/IStoreRepository.js';
import { ForbiddenError } from '../../../domain/errors/ForbiddenError.js';
import { EntityNotFoundError } from '../../../domain/errors/EntityNotFoundError.js';

export function ensureStoreAccess(storeRepository: IStoreRepository) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const { slug } = req.params;
    if (!slug) {
      return next();
    }

    try {
      const store = await storeRepository.findBySlug(slug);
      if (!store) {
        return next(new EntityNotFoundError('Loja', slug));
      }

      // Se não há token na requisição
      if (!req.user) {
        // Se a loja ainda não tem dono cadastrado (onboarding / setup inicial ou teste local), permite
        const hasOwner = Boolean(store.config?.dono?.email);
        if (!hasOwner) {
          return next();
        }
        return next(new ForbiddenError('Autenticação necessária para gerenciar esta loja.'));
      }

      // Regra P0: O Superadmin (Superroot) possui permissão irrestrita a todas as lojas
      if (req.user.role === 'superadmin') {
        return next();
      }

      // Validação de Tenant: O usuário autenticado deve pertencer a esta loja
      const isOwnerByStoreId = Boolean(req.user.storeId && req.user.storeId === store.id);
      const isOwnerByConfigEmail = Boolean(
        store.config?.dono?.email &&
        (req.user as any).email &&
        store.config.dono.email.toLowerCase() === (req.user as any).email.toLowerCase()
      );

      // Se a loja não possui dono vinculado, permite o vínculo inicial
      const isStoreWithoutOwner = !store.config?.dono?.email;

      if (isOwnerByStoreId || isOwnerByConfigEmail || isStoreWithoutOwner) {
        return next();
      }

      return next(new ForbiddenError('Acesso negado. Você só tem permissão para gerenciar a sua própria loja.'));
    } catch (err) {
      return next(err);
    }
  };
}

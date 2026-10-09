import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { StoreController } from '../controllers/StoreController.js';
import { StoreSubscriptionController } from '../controllers/StoreSubscriptionController.js';
import { ITokenProvider } from '../../../domain/providers/ITokenProvider.js';
import { IStoreRepository } from '../../../domain/repositories/IStoreRepository.js';
import { createAuthRoutes } from './auth.routes.js';
import { createStoreRoutes } from './store.routes.js';
import { ensureAuthenticated, ensureRole } from '../middlewares/AuthMiddleware.js';

export interface RouteDependencies {
  authController: AuthController;
  storeController: StoreController;
  storeSubscriptionController: StoreSubscriptionController;
  tokenProvider: ITokenProvider;
  storeRepository: IStoreRepository;
}

export function createApiRouter(deps: RouteDependencies): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  router.use('/auth', createAuthRoutes(deps.authController, deps.tokenProvider));
  router.use(
    '/stores',
    createStoreRoutes(
      deps.storeController,
      deps.storeSubscriptionController,
      deps.tokenProvider,
      deps.storeRepository
    )
  );

  // Endpoint direto GET /api/users exclusivo para superadmin
  router.get(
    '/users',
    ensureAuthenticated(deps.tokenProvider),
    ensureRole(['superadmin']),
    deps.authController.listUsers
  );

  return router;
}

import { Router } from 'express';
import { StoreController } from '../controllers/StoreController.js';
import { StoreSubscriptionController } from '../controllers/StoreSubscriptionController.js';
import { validateDto } from '../middlewares/ValidationMiddleware.js';
import { CreateStoreDTO } from '../../../domain/dtos/store/CreateStoreDTO.js';
import { TogglePaymentDTO } from '../../../domain/dtos/store/TogglePaymentDTO.js';
import { SelectPlanDTO } from '../../../domain/dtos/store/SelectPlanDTO.js';
import { ensureAuthenticated, optionalAuthenticated, ensureRole } from '../middlewares/AuthMiddleware.js';
import { ensureStoreAccess } from '../middlewares/StoreAccessMiddleware.js';
import { ITokenProvider } from '../../../domain/providers/ITokenProvider.js';
import { IStoreRepository } from '../../../domain/repositories/IStoreRepository.js';

export function createStoreRoutes(
  storeController: StoreController,
  storeSubscriptionController: StoreSubscriptionController,
  tokenProvider: ITokenProvider,
  storeRepository: IStoreRepository
): Router {
  const router = Router();

  // 1. Listar lojas (Superadmin vê todas; cliente vê apenas a sua)
  router.get('/', ensureAuthenticated(tokenProvider), storeController.list);

  // 2. Criar nova loja (Permite criação durante onboarding ou por admin)
  router.post('/', optionalAuthenticated(tokenProvider), validateDto(CreateStoreDTO), storeController.create);

  // 3. Consultar status da assinatura e expiração (Público ou lojista)
  router.get('/:slug/subscription', optionalAuthenticated(tokenProvider), storeSubscriptionController.getSubscription);

  // 4. Toggle de Pagamento da Loja (EXCLUSIVO Superadmin / Superroot)
  router.patch(
    '/:slug/payment',
    ensureAuthenticated(tokenProvider),
    ensureRole(['superadmin']),
    validateDto(TogglePaymentDTO),
    storeSubscriptionController.togglePayment
  );

  // 5. Selecionar Plano da Loja (Dono da loja ou Superadmin)
  router.patch(
    '/:slug/plan',
    ensureAuthenticated(tokenProvider),
    ensureStoreAccess(storeRepository),
    validateDto(SelectPlanDTO),
    storeSubscriptionController.selectPlan
  );

  // 6. Consultar loja por slug (Público para clientes finais do catálogo)
  router.get('/:slug', storeController.getBySlug);

  // 7. Atualizar / Publicar loja (Protegido: Dono da loja ou Superadmin)
  router.put(
    '/:slug',
    ensureAuthenticated(tokenProvider),
    ensureStoreAccess(storeRepository),
    storeController.update
  );

  // 8. Excluir loja (Restrito exclusivamente a Superadmin)
  router.delete('/:slug', ensureAuthenticated(tokenProvider), ensureRole(['superadmin']), storeController.delete);

  return router;
}

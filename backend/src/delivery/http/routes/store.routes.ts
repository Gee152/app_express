import { Router } from 'express';
import { StoreController } from '../controllers/StoreController.js';
import { StoreSubscriptionController } from '../controllers/StoreSubscriptionController.js';
import { CustomerAuthController } from '../controllers/CustomerAuthController.js';
import { AppointmentController } from '../controllers/AppointmentController.js';
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
  storeRepository: IStoreRepository,
  customerAuthController?: CustomerAuthController
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

  // 6.1 Integração Google Calendar (Público/Dono: link 1-clique e download .ics)
  router.get('/:slug/calendar/sync-link', storeController.getCalendarLink);
  router.get('/:slug/calendar/event.ics', storeController.downloadCalendarIcs);

  // 6.2 Autenticação & Cadastro de Clientes/Tutores com Pets (Público do Catálogo)
  if (customerAuthController) {
    router.post('/:slug/customers/register', customerAuthController.register);
    router.post('/:slug/customers/login', customerAuthController.login);
    router.get('/:slug/customers/me', customerAuthController.me);
  }

  // 7. Rotas de Agendamentos da Loja
  const appointmentController = new AppointmentController();
  router.post('/:slug/appointments', appointmentController.create);
  router.get('/:slug/appointments', appointmentController.list);
  router.patch('/:slug/appointments/:id/status', appointmentController.updateStatus);

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

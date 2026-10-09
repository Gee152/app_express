import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Infrastructure Providers
import { BcryptHashProvider } from './infrastructure/providers/hash/BcryptHashProvider.js';
import { JwtTokenProvider } from './infrastructure/providers/token/JwtTokenProvider.js';

// Infrastructure Repositories (TypeORM)
import { TypeOrmUserRepository } from './infrastructure/database/typeorm/repositories/TypeOrmUserRepository.js';
import { TypeOrmStoreRepository } from './infrastructure/database/typeorm/repositories/TypeOrmStoreRepository.js';

// Domain Use Cases
import { AuthenticateUserUseCase } from './domain/use-cases/auth/AuthenticateUserUseCase.js';
import { RegisterUserUseCase } from './domain/use-cases/auth/RegisterUserUseCase.js';
import { ListUsersUseCase } from './domain/use-cases/auth/ListUsersUseCase.js';
import { CreateStoreUseCase } from './domain/use-cases/store/CreateStoreUseCase.js';
import { GetStoreBySlugUseCase } from './domain/use-cases/store/GetStoreBySlugUseCase.js';
import { ListStoresUseCase } from './domain/use-cases/store/ListStoresUseCase.js';
import { UpdateStoreUseCase } from './domain/use-cases/store/UpdateStoreUseCase.js';
import { DeleteStoreUseCase } from './domain/use-cases/store/DeleteStoreUseCase.js';
import { ToggleStorePaymentUseCase } from './domain/use-cases/store/ToggleStorePaymentUseCase.js';
import { SelectStorePlanUseCase } from './domain/use-cases/store/SelectStorePlanUseCase.js';
import { GetStoreSubscriptionUseCase } from './domain/use-cases/store/GetStoreSubscriptionUseCase.js';

// Delivery HTTP Controllers & Routes
import { AuthController } from './delivery/http/controllers/AuthController.js';
import { StoreController } from './delivery/http/controllers/StoreController.js';
import { StoreSubscriptionController } from './delivery/http/controllers/StoreSubscriptionController.js';
import { createApiRouter } from './delivery/http/routes/index.js';
import { errorHandler } from './delivery/http/middlewares/ErrorHandlerMiddleware.js';

export function createApp(): Express {
  const app = express();

  // Global Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Injeção de Dependências (Composition Root)
  const hashProvider = new BcryptHashProvider();
  const tokenProvider = new JwtTokenProvider();

  const userRepository = new TypeOrmUserRepository();
  const storeRepository = new TypeOrmStoreRepository();

  const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, hashProvider, tokenProvider);
  const registerUserUseCase = new RegisterUserUseCase(userRepository, hashProvider);
  const listUsersUseCase = new ListUsersUseCase(userRepository);

  const createStoreUseCase = new CreateStoreUseCase(storeRepository);
  const getStoreBySlugUseCase = new GetStoreBySlugUseCase(storeRepository);
  const listStoresUseCase = new ListStoresUseCase(storeRepository);
  const updateStoreUseCase = new UpdateStoreUseCase(storeRepository);
  const deleteStoreUseCase = new DeleteStoreUseCase(storeRepository);

  const toggleStorePaymentUseCase = new ToggleStorePaymentUseCase(storeRepository);
  const selectStorePlanUseCase = new SelectStorePlanUseCase(storeRepository);
  const getStoreSubscriptionUseCase = new GetStoreSubscriptionUseCase(storeRepository);

  const authController = new AuthController(authenticateUserUseCase, registerUserUseCase, listUsersUseCase);
  const storeController = new StoreController(
    createStoreUseCase,
    getStoreBySlugUseCase,
    listStoresUseCase,
    updateStoreUseCase,
    deleteStoreUseCase
  );
  const storeSubscriptionController = new StoreSubscriptionController(
    toggleStorePaymentUseCase,
    selectStorePlanUseCase,
    getStoreSubscriptionUseCase
  );

  // Rotas da API
  app.use(
    '/api',
    createApiRouter({
      authController,
      storeController,
      storeSubscriptionController,
      tokenProvider,
      storeRepository,
    })
  );

  // Interceptor global de erros (deve ser o último middleware)
  app.use(errorHandler);

  return app;
}

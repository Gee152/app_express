import express, { Express } from 'express';
import http from 'node:http';
import { AddressInfo } from 'node:net';

import { createApiRouter } from './index.js';
import { AuthController } from '../controllers/AuthController.js';
import { StoreController } from '../controllers/StoreController.js';
import { InMemoryUserRepository } from '../../../domain/repositories/in-memory/InMemoryUserRepository.js';
import { InMemoryStoreRepository } from '../../../domain/repositories/in-memory/InMemoryStoreRepository.js';
import { ITokenProvider, ITokenPayload } from '../../../domain/providers/ITokenProvider.js';
import { IHashProvider } from '../../../domain/providers/IHashProvider.js';
import { AuthenticateUserUseCase } from '../../../domain/use-cases/auth/AuthenticateUserUseCase.js';
import { RegisterUserUseCase } from '../../../domain/use-cases/auth/RegisterUserUseCase.js';
import { ListUsersUseCase } from '../../../domain/use-cases/auth/ListUsersUseCase.js';
import { CreateStoreUseCase } from '../../../domain/use-cases/store/CreateStoreUseCase.js';
import { GetStoreBySlugUseCase } from '../../../domain/use-cases/store/GetStoreBySlugUseCase.js';
import { ListStoresUseCase } from '../../../domain/use-cases/store/ListStoresUseCase.js';
import { UpdateStoreUseCase } from '../../../domain/use-cases/store/UpdateStoreUseCase.js';
import { DeleteStoreUseCase } from '../../../domain/use-cases/store/DeleteStoreUseCase.js';
import { ToggleStorePaymentUseCase } from '../../../domain/use-cases/store/ToggleStorePaymentUseCase.js';
import { SelectStorePlanUseCase } from '../../../domain/use-cases/store/SelectStorePlanUseCase.js';
import { GetStoreSubscriptionUseCase } from '../../../domain/use-cases/store/GetStoreSubscriptionUseCase.js';
import { StoreSubscriptionController } from '../controllers/StoreSubscriptionController.js';
import { errorHandler } from '../middlewares/ErrorHandlerMiddleware.js';

class FakeHashProvider implements IHashProvider {
  async generateHash(payload: string): Promise<string> {
    return `hashed_${payload}`;
  }
  async compareHash(payload: string, hashed: string): Promise<boolean> {
    return `hashed_${payload}` === hashed;
  }
}

class FakeTokenProvider implements ITokenProvider {
  generateToken(payload: ITokenPayload): string {
    return `fake_token:${payload.userId}:${payload.role}:${payload.storeId || ''}`;
  }
  verifyToken(token: string): ITokenPayload {
    if (!token.startsWith('fake_token:')) {
      throw new Error('Token inválido');
    }
    const parts = token.split(':');
    return {
      userId: parts[1],
      role: parts[2],
      storeId: parts[3] || null,
    };
  }
}

describe('Unit Tests: Main Router & Healthcheck (GET /api/health) [Jest]', () => {
  let app: Express;
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const userRepository = new InMemoryUserRepository();
    const storeRepository = new InMemoryStoreRepository();
    const hashProvider = new FakeHashProvider();
    const tokenProvider = new FakeTokenProvider();

    const authController = new AuthController(
      new AuthenticateUserUseCase(userRepository, hashProvider, tokenProvider),
      new RegisterUserUseCase(userRepository, hashProvider),
      new ListUsersUseCase(userRepository)
    );

    const storeController = new StoreController(
      new CreateStoreUseCase(storeRepository),
      new GetStoreBySlugUseCase(storeRepository),
      new ListStoresUseCase(storeRepository),
      new UpdateStoreUseCase(storeRepository),
      new DeleteStoreUseCase(storeRepository)
    );

    const storeSubscriptionController = new StoreSubscriptionController(
      new ToggleStorePaymentUseCase(storeRepository),
      new SelectStorePlanUseCase(storeRepository),
      new GetStoreSubscriptionUseCase(storeRepository)
    );

    app = express();
    app.use(express.json());
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
    app.use(errorHandler);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as AddressInfo).port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/health should return status ok and ISO timestamp (200 OK)', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const data = (await response.json()) as any;

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
    expect(isNaN(Date.parse(data.timestamp))).toBe(false);
  });
});

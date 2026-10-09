import express, { Express } from 'express';
import http from 'node:http';
import { AddressInfo } from 'node:net';

import { InMemoryUserRepository } from '../../../domain/repositories/in-memory/InMemoryUserRepository.js';
import { IHashProvider } from '../../../domain/providers/IHashProvider.js';
import { ITokenProvider, ITokenPayload } from '../../../domain/providers/ITokenProvider.js';
import { AuthenticateUserUseCase } from '../../../domain/use-cases/auth/AuthenticateUserUseCase.js';
import { RegisterUserUseCase } from '../../../domain/use-cases/auth/RegisterUserUseCase.js';
import { ListUsersUseCase } from '../../../domain/use-cases/auth/ListUsersUseCase.js';
import { AuthController } from '../controllers/AuthController.js';
import { createAuthRoutes } from './auth.routes.js';
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

describe('Unit Tests: Auth Routes (POST /login, POST /register, GET /me, GET /users) [Jest]', () => {
  let app: Express;
  let server: http.Server;
  let baseUrl: string;

  let userRepository: InMemoryUserRepository;
  let hashProvider: FakeHashProvider;
  let tokenProvider: FakeTokenProvider;

  beforeAll(async () => {
    userRepository = new InMemoryUserRepository();
    hashProvider = new FakeHashProvider();
    tokenProvider = new FakeTokenProvider();

    const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, hashProvider, tokenProvider);
    const registerUserUseCase = new RegisterUserUseCase(userRepository, hashProvider);
    const listUsersUseCase = new ListUsersUseCase(userRepository);

    const authController = new AuthController(authenticateUserUseCase, registerUserUseCase, listUsersUseCase);

    app = express();
    app.use(express.json());
    app.use('/auth', createAuthRoutes(authController, tokenProvider));
    app.use(errorHandler);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as AddressInfo).port;
        baseUrl = `http://localhost:${port}/auth`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully (201 Created)', async () => {
      const payload = {
        name: 'Cliente Lojista',
        email: 'lojista@test.com',
        password: 'password123',
      };

      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(201);
      expect(data.name).toBe('Cliente Lojista');
      expect(data.email).toBe('lojista@test.com');
      expect(data.role).toBe('owner');
      expect(data.password).toBeUndefined();
    });

    it('should reject registration if email already exists (409 Conflict)', async () => {
      const payload = {
        name: 'Outro Usuario',
        email: 'lojista@test.com',
        password: 'password123',
      };

      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(409);
      expect(data.status).toBe('error');
      expect(data.message).toMatch(/já está cadastrado/i);
    });

    it('should reject registration with invalid DTO (400 Bad Request)', async () => {
      const invalidPayload = {
        name: '',
        email: 'not-an-email',
        password: '123',
      };

      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(Array.isArray(data.errors)).toBe(true);
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /auth/login', () => {
    it('should authenticate with valid credentials and return JWT token (200 OK)', async () => {
      const credentials = {
        email: 'lojista@test.com',
        password: 'password123',
      };

      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe('lojista@test.com');
      expect(data.user.role).toBe('owner');
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      const invalidCredentials = {
        email: 'lojista@test.com',
        password: 'wrong_password',
      };

      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidCredentials),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
      expect(data.message).toMatch(/inválid/i);
    });

    it('should reject login with missing fields (400 Bad Request)', async () => {
      const missingPayload = {
        email: 'notanemail',
      };

      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missingPayload),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.errors).toBeDefined();
    });
  });

  describe('GET /auth/me', () => {
    it('should return authenticated user profile when token is valid (200 OK)', async () => {
      const user = userRepository.users[0];
      const validToken = tokenProvider.generateToken({
        userId: user.id,
        role: user.role,
        storeId: user.storeId,
      });

      const response = await fetch(`${baseUrl}/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.user.userId).toBe(user.id);
      expect(data.user.role).toBe(user.role);
    });

    it('should return 401 Unauthorized when no token is provided', async () => {
      const response = await fetch(`${baseUrl}/me`, {
        method: 'GET',
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
    });

    it('should return 401 Unauthorized when token is invalid', async () => {
      const response = await fetch(`${baseUrl}/me`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid_garbage_token',
        },
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
    });
  });

  describe('GET /auth/users', () => {
    it('should allow superadmin to list all users (200 OK)', async () => {
      const superadminToken = tokenProvider.generateToken({
        userId: 'superadmin-id',
        role: 'superadmin',
      });

      const response = await fetch(`${baseUrl}/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${superadminToken}`,
        },
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should forbid non-superadmin users from listing all users (403 Forbidden)', async () => {
      const ownerToken = tokenProvider.generateToken({
        userId: 'owner-id',
        role: 'owner',
      });

      const response = await fetch(`${baseUrl}/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(403);
      expect(data.status).toBe('error');
      expect(data.message).toMatch(/Acesso restrito/i);
    });
  });
});

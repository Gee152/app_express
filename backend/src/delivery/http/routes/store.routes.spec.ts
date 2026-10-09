import express, { Express } from 'express';
import http from 'node:http';
import { AddressInfo } from 'node:net';

import { InMemoryStoreRepository } from '../../../domain/repositories/in-memory/InMemoryStoreRepository.js';
import { ITokenProvider, ITokenPayload } from '../../../domain/providers/ITokenProvider.js';
import { CreateStoreUseCase } from '../../../domain/use-cases/store/CreateStoreUseCase.js';
import { GetStoreBySlugUseCase } from '../../../domain/use-cases/store/GetStoreBySlugUseCase.js';
import { ListStoresUseCase } from '../../../domain/use-cases/store/ListStoresUseCase.js';
import { UpdateStoreUseCase } from '../../../domain/use-cases/store/UpdateStoreUseCase.js';
import { DeleteStoreUseCase } from '../../../domain/use-cases/store/DeleteStoreUseCase.js';
import { ToggleStorePaymentUseCase } from '../../../domain/use-cases/store/ToggleStorePaymentUseCase.js';
import { SelectStorePlanUseCase } from '../../../domain/use-cases/store/SelectStorePlanUseCase.js';
import { GetStoreSubscriptionUseCase } from '../../../domain/use-cases/store/GetStoreSubscriptionUseCase.js';
import { StoreController } from '../controllers/StoreController.js';
import { StoreSubscriptionController } from '../controllers/StoreSubscriptionController.js';
import { createStoreRoutes } from './store.routes.js';
import { errorHandler } from '../middlewares/ErrorHandlerMiddleware.js';

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

describe('Unit Tests: Store Routes (POST, GET /:slug, PUT /:slug, GET /, DELETE /:slug) [Jest]', () => {
  let app: Express;
  let server: http.Server;
  let baseUrl: string;

  let storeRepository: InMemoryStoreRepository;
  let tokenProvider: FakeTokenProvider;

  beforeAll(async () => {
    storeRepository = new InMemoryStoreRepository();
    tokenProvider = new FakeTokenProvider();

    const createStoreUseCase = new CreateStoreUseCase(storeRepository);
    const getStoreBySlugUseCase = new GetStoreBySlugUseCase(storeRepository);
    const listStoresUseCase = new ListStoresUseCase(storeRepository);
    const updateStoreUseCase = new UpdateStoreUseCase(storeRepository);
    const deleteStoreUseCase = new DeleteStoreUseCase(storeRepository);

    const storeController = new StoreController(
      createStoreUseCase,
      getStoreBySlugUseCase,
      listStoresUseCase,
      updateStoreUseCase,
      deleteStoreUseCase
    );

    const storeSubscriptionController = new StoreSubscriptionController(
      new ToggleStorePaymentUseCase(storeRepository),
      new SelectStorePlanUseCase(storeRepository),
      new GetStoreSubscriptionUseCase(storeRepository)
    );

    app = express();
    app.use(express.json());
    app.use('/stores', createStoreRoutes(storeController, storeSubscriptionController, tokenProvider, storeRepository));
    app.use(errorHandler);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as AddressInfo).port;
        baseUrl = `http://localhost:${port}/stores`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('POST /stores', () => {
    it('should create a new store successfully (201 Created)', async () => {
      const payload = {
        name: 'Hamburgueria Artesanal',
        slug: 'hamburgueria-artesanal',
        whatsapp: '5511999998888',
        status: 'rascunho',
        config: {
          nichoId: 'restaurante',
          isOnboarded: false,
        },
      };

      const response = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.name).toBe('Hamburgueria Artesanal');
      expect(data.slug).toBe('hamburgueria-artesanal');
      expect(data.whatsapp).toBe('5511999998888');
      expect(data.status).toBe('rascunho');
      expect(data.config.nichoId).toBe('restaurante');
    });

    it('should reject store creation with duplicate slug (409 Conflict)', async () => {
      const payload = {
        name: 'Outro Nome Mas Mesmo Slug',
        slug: 'hamburgueria-artesanal',
      };

      const response = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(409);
      expect(data.status).toBe('error');
      expect(data.message).toMatch(/já existe/i);
    });

    it('should reject store creation with invalid slug pattern (400 Bad Request)', async () => {
      const payload = {
        name: 'Loja Teste',
        slug: 'SLUG INVALIDO!',
      };

      const response = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(Array.isArray(data.errors)).toBe(true);
    });
  });

  describe('GET /stores/:slug', () => {
    it('should return store data for an existing slug (200 OK)', async () => {
      const response = await fetch(`${baseUrl}/hamburgueria-artesanal`, {
        method: 'GET',
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.slug).toBe('hamburgueria-artesanal');
      expect(data.name).toBe('Hamburgueria Artesanal');
    });

    it('should return 404 Not Found when store slug does not exist', async () => {
      const response = await fetch(`${baseUrl}/loja-inexistente-xyz`, {
        method: 'GET',
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(404);
      expect(data.status).toBe('error');
      expect(data.message).toMatch(/não foi encontrado/i);
    });
  });

  describe('PUT /stores/:slug', () => {
    it('should update store data successfully when authenticated (200 OK)', async () => {
      const superadminToken = tokenProvider.generateToken({
        userId: 'superadmin-1',
        role: 'superadmin',
      });

      const updatePayload = {
        name: 'Hamburgueria Artesanal Atualizada',
        status: 'publicada',
        config: {
          nichoId: 'restaurante',
          isOnboarded: true,
        },
      };

      const response = await fetch(`${baseUrl}/hamburgueria-artesanal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superadminToken}`,
        },
        body: JSON.stringify(updatePayload),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.name).toBe('Hamburgueria Artesanal Atualizada');
      expect(data.status).toBe('publicada');
      expect(data.config.isOnboarded).toBe(true);
    });

    it('should reject update when unauthenticated (401 Unauthorized)', async () => {
      const response = await fetch(`${baseUrl}/hamburgueria-artesanal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hack Loja' }),
      });
      expect(response.status).toBe(401);
    });

    it('should return 404 Not Found when updating a non-existing store', async () => {
      const superadminToken = tokenProvider.generateToken({
        userId: 'superadmin-1',
        role: 'superadmin',
      });

      const response = await fetch(`${baseUrl}/loja-fantasma-999`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superadminToken}`,
        },
        body: JSON.stringify({ name: 'Nova Loja' }),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(404);
      expect(data.status).toBe('error');
    });
  });

  describe('GET /stores (List & Isolation)', () => {
    let secondStoreId: string;

    beforeAll(async () => {
      const res = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Segunda Loja Modas',
          slug: 'segunda-loja-modas',
        }),
      });
      const created = (await res.json()) as any;
      secondStoreId = created.id;
    });

    it('should return all stores when authenticated as superadmin (200 OK)', async () => {
      const superadminToken = tokenProvider.generateToken({
        userId: 'superadmin-1',
        role: 'superadmin',
      });

      const response = await fetch(`${baseUrl}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${superadminToken}`,
        },
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(2);
    });

    it('should isolate and return ONLY tenant store for a regular owner (200 OK)', async () => {
      const ownerToken = tokenProvider.generateToken({
        userId: 'owner-lojista',
        role: 'owner',
        storeId: secondStoreId,
      });

      const response = await fetch(`${baseUrl}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].id).toBe(secondStoreId);
      expect(data[0].slug).toBe('segunda-loja-modas');
    });

    it('should reject unauthenticated list request (401 Unauthorized)', async () => {
      const response = await fetch(`${baseUrl}`, {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /stores/:slug', () => {
    it('should forbid non-superadmin from deleting a store (403 Forbidden)', async () => {
      const ownerToken = tokenProvider.generateToken({
        userId: 'owner-lojista',
        role: 'owner',
      });

      const response = await fetch(`${baseUrl}/segunda-loja-modas`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(403);
      expect(data.status).toBe('error');
      expect(data.message).toMatch(/Acesso restrito/i);
    });

    it('should allow superadmin to delete a store (204 No Content)', async () => {
      const superadminToken = tokenProvider.generateToken({
        userId: 'superadmin-1',
        role: 'superadmin',
      });

      const response = await fetch(`${baseUrl}/segunda-loja-modas`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${superadminToken}`,
        },
      });

      expect(response.status).toBe(204);

      const verifyResponse = await fetch(`${baseUrl}/segunda-loja-modas`, {
        method: 'GET',
      });
      expect(verifyResponse.status).toBe(404);
    });
  });

  describe('PATCH /stores/:slug/payment (Superadmin Payment Toggle)', () => {
    it('should reject payment toggle when user is not superadmin (403 Forbidden)', async () => {
      const ownerToken = tokenProvider.generateToken({
        userId: 'owner-1',
        role: 'owner',
      });

      const response = await fetch(`${baseUrl}/hamburgueria-artesanal/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ isPaid: true }),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(403);
      expect(data.status).toBe('error');
    });

    it('should allow superadmin to activate store payment and calculate expiration (200 OK)', async () => {
      const superadminToken = tokenProvider.generateToken({
        userId: 'superadmin-1',
        role: 'superadmin',
      });

      const response = await fetch(`${baseUrl}/hamburgueria-artesanal/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superadminToken}`,
        },
        body: JSON.stringify({ isPaid: true }),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.store.isPaid).toBe(true);
      expect(data.subscription.isPaid).toBe(true);
      expect(data.subscription.status).toBe('ativo');
      expect(data.subscription.daysRemaining).toBe(30);
      expect(data.subscription.expiresAt).toBeDefined();
    });

    it('should allow superadmin to suspend/deactivate store payment (200 OK)', async () => {
      const superadminToken = tokenProvider.generateToken({
        userId: 'superadmin-1',
        role: 'superadmin',
      });

      const response = await fetch(`${baseUrl}/hamburgueria-artesanal/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superadminToken}`,
        },
        body: JSON.stringify({ isPaid: false }),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.store.isPaid).toBe(false);
      expect(data.subscription.isPaid).toBe(false);
      expect(data.subscription.status).toBe('pendente-pagamento');
    });
  });

  describe('PATCH /stores/:slug/plan (Plan Selection)', () => {
    it('should allow superadmin or store owner to select Trimestral (90 days) plan', async () => {
      const superadminToken = tokenProvider.generateToken({
        userId: 'superadmin-1',
        role: 'superadmin',
      });

      const response = await fetch(`${baseUrl}/hamburgueria-artesanal/plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superadminToken}`,
        },
        body: JSON.stringify({ planType: 'trimestral' }),
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.store.planType).toBe('trimestral');
      expect(data.store.planDays).toBe(90);
      expect(data.subscription.planDays).toBe(90);
    });
  });

  describe('GET /stores/:slug/subscription (Subscription Status)', () => {
    it('should return server-authoritative calculated status', async () => {
      const response = await fetch(`${baseUrl}/hamburgueria-artesanal/subscription`, {
        method: 'GET',
      });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.planType).toBe('trimestral');
      expect(data.planDays).toBe(90);
      expect(data.status).toBe('pendente-pagamento');
      expect(data.isPaid).toBe(false);
    });
  });
});

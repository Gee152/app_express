import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validateDto } from '../middlewares/ValidationMiddleware.js';
import { LoginRequestDTO } from '../../../domain/dtos/auth/LoginRequestDTO.js';
import { RegisterUserDTO } from '../../../domain/dtos/auth/RegisterUserDTO.js';
import { ensureAuthenticated, ensureRole } from '../middlewares/AuthMiddleware.js';
import { ITokenProvider } from '../../../domain/providers/ITokenProvider.js';

export function createAuthRoutes(
  authController: AuthController,
  tokenProvider: ITokenProvider
): Router {
  const router = Router();

  router.post('/login', validateDto(LoginRequestDTO), authController.login);
  router.post('/register', validateDto(RegisterUserDTO), authController.register);
  router.get('/me', ensureAuthenticated(tokenProvider), authController.me);
  router.get('/users', ensureAuthenticated(tokenProvider), ensureRole(['superadmin']), authController.listUsers);

  return router;
}

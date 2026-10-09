import { Request, Response, NextFunction } from 'express';
import { ITokenProvider } from '../../../domain/providers/ITokenProvider.js';
import { InvalidCredentialsError } from '../../../domain/errors/InvalidCredentialsError.js';
import { ForbiddenError } from '../../../domain/errors/ForbiddenError.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    storeId?: string | null;
    role: string;
  };
}

export function ensureAuthenticated(tokenProvider: ITokenProvider) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new InvalidCredentialsError('Token de autenticação não fornecido.'));
    }

    const [scheme, token] = authHeader.split(' ');

    if (!/^Bearer$/i.test(scheme) || !token) {
      return next(new InvalidCredentialsError('Formato de token inválido. Utilize: Bearer <token>'));
    }

    try {
      const payload = tokenProvider.verifyToken(token);
      req.user = payload;
      return next();
    } catch {
      return next(new InvalidCredentialsError('Token de autenticação inválido ou expirado.'));
    }
  };
}

export function optionalAuthenticated(tokenProvider: ITokenProvider) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const [scheme, token] = authHeader.split(' ');

    if (/^Bearer$/i.test(scheme) && token) {
      try {
        req.user = tokenProvider.verifyToken(token);
      } catch {
        // Token inválido ou expirado ignorado em rotas de auth opcional
      }
    }

    return next();
  };
}

export function ensureRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Acesso restrito. Você não possui permissão para acessar este recurso.'));
    }
    return next();
  };
}

import jwt from 'jsonwebtoken';
import { ITokenProvider, ITokenPayload } from '../../../domain/providers/ITokenProvider.js';
import { authConfig } from '../../../config/auth.config.js';
import { InvalidCredentialsError } from '../../../domain/errors/InvalidCredentialsError.js';

export class JwtTokenProvider implements ITokenProvider {
  generateToken(payload: ITokenPayload): string {
    return jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.expiresIn as any,
    });
  }

  verifyToken(token: string): ITokenPayload {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret) as ITokenPayload;
      return decoded;
    } catch {
      throw new InvalidCredentialsError('Token de autenticação inválido ou expirado.');
    }
  }
}

import { DomainError } from './DomainError.js';

export class ForbiddenError extends DomainError {
  public readonly statusCode = 403;

  constructor(message = 'Acesso não autorizado para este perfil.') {
    super(message);
  }
}

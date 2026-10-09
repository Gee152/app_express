import { DomainError } from './DomainError.js';

export class UnauthorizedStoreAccessError extends DomainError {
  public readonly statusCode = 403;

  constructor(message = 'Acesso não autorizado para esta loja.') {
    super(message);
  }
}

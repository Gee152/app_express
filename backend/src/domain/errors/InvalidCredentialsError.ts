import { DomainError } from './DomainError.js';

export class InvalidCredentialsError extends DomainError {
  public readonly statusCode = 401;

  constructor(message = 'E-mail ou senha inválidos.') {
    super(message);
  }
}

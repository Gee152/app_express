import { DomainError } from './DomainError.js';

export class EmailAlreadyInUseError extends DomainError {
  public readonly statusCode = 409;

  constructor(email: string) {
    super(`O e-mail "${email}" já está cadastrado.`);
  }
}

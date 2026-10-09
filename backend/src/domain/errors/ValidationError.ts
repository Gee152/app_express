import { DomainError } from './DomainError.js';

export class ValidationError extends DomainError {
  public readonly statusCode = 400;
  public readonly errors: string[];

  constructor(errors: string[]) {
    super('Falha de validação nos dados enviados.');
    this.errors = errors;
  }
}

import { DomainError } from './DomainError.js';

export class EntityNotFoundError extends DomainError {
  public readonly statusCode = 404;

  constructor(entityName: string, identifier?: string) {
    super(`${entityName} ${identifier ? `"${identifier}" ` : ''}não foi encontrado(a).`);
  }
}

import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/DomainError.js';
import { ValidationError } from '../../../domain/errors/ValidationError.js';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      errors: error.errors,
    });
  }

  if (error instanceof DomainError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  if ((error as any).type === 'entity.too.large' || (error as any).status === 413) {
    return res.status(413).json({
      status: 'error',
      message: 'O tamanho dos dados enviados excede o limite permitido pelo servidor.',
    });
  }

  console.error('Unhandled Server Error:', error);

  return res.status(500).json({
    status: 'error',
    message: 'Ocorreu um erro interno inesperado no servidor.',
  });
}

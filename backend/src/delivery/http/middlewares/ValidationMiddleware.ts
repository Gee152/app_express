import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { ValidationError } from '../../../domain/errors/ValidationError.js';

export function validateDto(dtoClass: any) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors: ClassValidatorError[] = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const formattedErrors = errors.flatMap((err) =>
        err.constraints ? Object.values(err.constraints) : ['Valor inválido']
      );
      return next(new ValidationError(formattedErrors));
    }

    req.body = dtoInstance;
    next();
  };
}

import { Request, Response, NextFunction } from 'express';
import { AuthenticateUserUseCase } from '../../../domain/use-cases/auth/AuthenticateUserUseCase.js';
import { RegisterUserUseCase } from '../../../domain/use-cases/auth/RegisterUserUseCase.js';
import { ListUsersUseCase } from '../../../domain/use-cases/auth/ListUsersUseCase.js';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware.js';

export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authenticateUserUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUserUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  public me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ user: req.user });
    } catch (err) {
      next(err);
    }
  };

  public listUsers = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.listUsersUseCase.execute();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  };
}

import { Request, Response, NextFunction } from 'express';
import { CreateStoreUseCase } from '../../../domain/use-cases/store/CreateStoreUseCase.js';
import { GetStoreBySlugUseCase } from '../../../domain/use-cases/store/GetStoreBySlugUseCase.js';
import { ListStoresUseCase } from '../../../domain/use-cases/store/ListStoresUseCase.js';
import { UpdateStoreUseCase } from '../../../domain/use-cases/store/UpdateStoreUseCase.js';
import { DeleteStoreUseCase } from '../../../domain/use-cases/store/DeleteStoreUseCase.js';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware.js';

export class StoreController {
  constructor(
    private readonly createStoreUseCase: CreateStoreUseCase,
    private readonly getStoreBySlugUseCase: GetStoreBySlugUseCase,
    private readonly listStoresUseCase: ListStoresUseCase,
    private readonly updateStoreUseCase: UpdateStoreUseCase,
    private readonly deleteStoreUseCase: DeleteStoreUseCase,
  ) {}

  public list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stores = await this.listStoresUseCase.execute();
      // Isolamento: cliente comum só visualiza sua própria loja; superadmin visualiza todas
      if (req.user && req.user.role !== 'superadmin') {
        const filtered = stores.filter((s) => s.id === req.user?.storeId);
        res.status(200).json(filtered);
        return;
      }
      res.status(200).json(stores);
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const store = await this.createStoreUseCase.execute(req.body);
      res.status(201).json(store);
    } catch (err) {
      next(err);
    }
  };

  public getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const store = await this.getStoreBySlugUseCase.execute(slug);
      res.status(200).json(store);
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const store = await this.updateStoreUseCase.execute(slug, req.body);
      res.status(200).json(store);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      await this.deleteStoreUseCase.execute(slug);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware.js';
import { ToggleStorePaymentUseCase } from '../../../domain/use-cases/store/ToggleStorePaymentUseCase.js';
import { SelectStorePlanUseCase } from '../../../domain/use-cases/store/SelectStorePlanUseCase.js';
import { GetStoreSubscriptionUseCase } from '../../../domain/use-cases/store/GetStoreSubscriptionUseCase.js';

export class StoreSubscriptionController {
  constructor(
    private readonly toggleStorePaymentUseCase: ToggleStorePaymentUseCase,
    private readonly selectStorePlanUseCase: SelectStorePlanUseCase,
    private readonly getStoreSubscriptionUseCase: GetStoreSubscriptionUseCase
  ) {}

  public togglePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const { isPaid } = req.body;
      const result = await this.toggleStorePaymentUseCase.execute({
        slug,
        isPaid,
        requesterRole: req.user?.role || '',
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  public selectPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const { planType } = req.body;
      const result = await this.selectStorePlanUseCase.execute({
        slug,
        planType,
        requesterRole: req.user?.role || '',
        requesterStoreId: req.user?.storeId,
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  public getSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const result = await this.getStoreSubscriptionUseCase.execute(slug);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}

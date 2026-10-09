import { IsIn } from 'class-validator';
import { PlanType } from '../../value-objects/StoreSubscription.js';

export class SelectPlanDTO {
  @IsIn(['mensal', 'trimestral', 'semestral', 'anual'], {
    message: 'Plano inválido. Escolha entre: mensal, trimestral, semestral ou anual.',
  })
  planType!: PlanType;
}

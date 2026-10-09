import { IsBoolean } from 'class-validator';

export class TogglePaymentDTO {
  @IsBoolean({ message: 'O campo isPaid deve ser um booleano (true ou false).' })
  isPaid!: boolean;
}

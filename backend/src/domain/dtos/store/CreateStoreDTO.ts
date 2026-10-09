import { IsNotEmpty, IsObject, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateStoreDTO {
  @IsString({ message: 'O nome da loja deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da loja é obrigatório.' })
  @MinLength(2, { message: 'O nome da loja deve ter ao menos 2 caracteres.' })
  name!: string;

  @IsString({ message: 'O slug deve ser um texto.' })
  @IsNotEmpty({ message: 'O slug da loja é obrigatório.' })
  @Matches(/^[a-z0-9-]+$/, { message: 'O slug deve conter apenas letras minúsculas, números e hífens.' })
  slug!: string;

  @IsOptional()
  @IsString({ message: 'O número de WhatsApp deve ser um texto.' })
  whatsapp?: string;

  @IsOptional()
  @IsString({ message: 'O status da loja deve ser um texto.' })
  status?: 'rascunho' | 'publicada';

  @IsOptional()
  @IsObject({ message: 'A configuração da loja deve ser um objeto JSON.' })
  config?: Record<string, any>;
}

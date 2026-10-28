import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsBoolean, IsArray } from 'class-validator';

export class CustomerPetDTO {
  @IsString()
  @IsNotEmpty({ message: 'O nome do pet é obrigatório.' })
  name!: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsString()
  species?: string;

  @IsOptional()
  @IsString()
  specialCare?: string;

  @IsOptional()
  @IsBoolean()
  hasTransportBox?: boolean;
}

export class RegisterCustomerDTO {
  @IsString({ message: 'O nome deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name!: string;

  @IsEmail({}, { message: 'Forneça um endereço de e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve conter pelo menos 6 caracteres.' })
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  hasTransportBox?: boolean;

  @IsOptional()
  @IsBoolean()
  hasMultiplePets?: boolean;

  @IsOptional()
  @IsArray()
  pets?: CustomerPetDTO[];
}

export class LoginCustomerDTO {
  @IsEmail({}, { message: 'Forneça um endereço de e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password!: string;
}

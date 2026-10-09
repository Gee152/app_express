import { User } from '../../../infrastructure/database/typeorm/entities/User.js';
import { IUserRepository } from '../../repositories/IUserRepository.js';
import { IHashProvider } from '../../providers/IHashProvider.js';
import { EmailAlreadyInUseError } from '../../errors/EmailAlreadyInUseError.js';
import { RegisterUserDTO } from '../../dtos/auth/RegisterUserDTO.js';

export interface RegisterUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId: string | null;
  createdAt: Date;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashProvider: IHashProvider,
  ) {}

  async execute(dto: RegisterUserDTO): Promise<RegisterUserResponse> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new EmailAlreadyInUseError(dto.email);
    }

    // Usuários registrados via tela de cadastro entram sempre como clientes da plataforma (owner)
    const role = 'owner';
    const passwordHash = await this.hashProvider.generateHash(dto.password);

    const user = new User({
      name: dto.name,
      email: dto.email,
      passwordHash,
      storeId: dto.storeId || null,
      role,
    });

    const created = await this.userRepository.create(user);

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      storeId: created.storeId,
      createdAt: created.createdAt,
    };
  }
}

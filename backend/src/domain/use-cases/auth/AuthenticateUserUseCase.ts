import { IUserRepository } from '../../repositories/IUserRepository.js';
import { IHashProvider } from '../../providers/IHashProvider.js';
import { ITokenProvider } from '../../providers/ITokenProvider.js';
import { InvalidCredentialsError } from '../../errors/InvalidCredentialsError.js';
import { LoginRequestDTO } from '../../dtos/auth/LoginRequestDTO.js';
import { LoginResponseDTO } from '../../dtos/auth/LoginResponseDTO.js';

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashProvider: IHashProvider,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(dto: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.hashProvider.compareHash(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenProvider.generateToken({
      userId: user.id,
      storeId: user.storeId,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      },
    };
  }
}

import { InMemoryUserRepository } from '../../repositories/in-memory/InMemoryUserRepository.js';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase.js';
import { RegisterUserUseCase } from './RegisterUserUseCase.js';
import { IHashProvider } from '../../providers/IHashProvider.js';
import { ITokenProvider, ITokenPayload } from '../../providers/ITokenProvider.js';
import { InvalidCredentialsError } from '../../errors/InvalidCredentialsError.js';
import { EmailAlreadyInUseError } from '../../errors/EmailAlreadyInUseError.js';

// Mocks rápidos de providers para teste unitário (Zero dependência externa)
class FakeHashProvider implements IHashProvider {
  async generateHash(payload: string): Promise<string> {
    return `hashed_${payload}`;
  }
  async compareHash(payload: string, hashed: string): Promise<boolean> {
    return `hashed_${payload}` === hashed;
  }
}

class FakeTokenProvider implements ITokenProvider {
  generateToken(payload: ITokenPayload): string {
    return `fake_token_${payload.userId}`;
  }
  verifyToken(token: string): ITokenPayload {
    return { userId: token.replace('fake_token_', ''), role: 'owner' };
  }
}

describe('Auth Use Cases - Clean Architecture & SOLID (Jest)', () => {
  it('should register a new user and return secure profile data', async () => {
    const userRepository = new InMemoryUserRepository();
    const hashProvider = new FakeHashProvider();
    const registerUseCase = new RegisterUserUseCase(userRepository, hashProvider);

    const user = await registerUseCase.execute({
      name: 'Gabriel Teste',
      email: 'gabriel@teste.com',
      password: 'minhasenha123',
    });

    expect(user.name).toBe('Gabriel Teste');
    expect(user.email).toBe('gabriel@teste.com');
    expect(user.role).toBe('owner');
    expect(userRepository.users.length).toBe(1);

    const secondUser = await registerUseCase.execute({
      name: 'Segundo Lojista',
      email: 'lojista@teste.com',
      password: 'minhasenha123',
    });
    expect(secondUser.role).toBe('owner');
  });

  it('should not allow duplicate email registration', async () => {
    const userRepository = new InMemoryUserRepository();
    const hashProvider = new FakeHashProvider();
    const registerUseCase = new RegisterUserUseCase(userRepository, hashProvider);

    await registerUseCase.execute({
      name: 'Gabriel Teste',
      email: 'duplicado@teste.com',
      password: 'minhasenha123',
    });

    await expect(
      registerUseCase.execute({
        name: 'Outro Usuario',
        email: 'duplicado@teste.com',
        password: 'outrasenha123',
      })
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });

  it('should authenticate user with valid credentials and return JWT token', async () => {
    const userRepository = new InMemoryUserRepository();
    const hashProvider = new FakeHashProvider();
    const tokenProvider = new FakeTokenProvider();

    const registerUseCase = new RegisterUserUseCase(userRepository, hashProvider);
    await registerUseCase.execute({
      name: 'Gabriel Auth',
      email: 'auth@teste.com',
      password: 'password123',
    });

    const authUseCase = new AuthenticateUserUseCase(userRepository, hashProvider, tokenProvider);
    const response = await authUseCase.execute({
      email: 'auth@teste.com',
      password: 'password123',
    });

    expect(response.token.startsWith('fake_token_')).toBe(true);
    expect(response.user.email).toBe('auth@teste.com');
  });

  it('should reject authentication with wrong password', async () => {
    const userRepository = new InMemoryUserRepository();
    const hashProvider = new FakeHashProvider();
    const tokenProvider = new FakeTokenProvider();

    const registerUseCase = new RegisterUserUseCase(userRepository, hashProvider);
    await registerUseCase.execute({
      name: 'Gabriel Auth',
      email: 'wrongpass@teste.com',
      password: 'password123',
    });

    const authUseCase = new AuthenticateUserUseCase(userRepository, hashProvider, tokenProvider);

    await expect(
      authUseCase.execute({
        email: 'wrongpass@teste.com',
        password: 'incorrectPassword',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});

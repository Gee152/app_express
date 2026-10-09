import bcrypt from 'bcrypt';
import { IHashProvider } from '../../../domain/providers/IHashProvider.js';

export class BcryptHashProvider implements IHashProvider {
  private readonly saltRounds = 10;

  async generateHash(payload: string): Promise<string> {
    return bcrypt.hash(payload, this.saltRounds);
  }

  async compareHash(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}

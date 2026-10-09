import { IUserRepository, UserWithStoreData } from '../../repositories/IUserRepository.js';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserWithStoreData[]> {
    return this.userRepository.findAllWithStore();
  }
}

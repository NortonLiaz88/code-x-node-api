import { ExistUserRepository } from 'src/data/protocols/db/user/db-exist-user-repository';
import { ExistUser } from 'src/domain/usecases/user/exist-user/exist-user';

export class DbExistUser implements ExistUser {
  constructor(private readonly existUserRepository: ExistUserRepository) {}

  async existUserWithUsername(username: string): Promise<boolean> {
    return await this.existUserRepository.existUserWithUsername(username);
  }

  async existUserWithEmail(email: string): Promise<boolean> {
    return await this.existUserRepository.existUserWithEmail(email);
  }

  async existUserWithPhoneNumber(phoneNumber: string): Promise<boolean> {
    return await this.existUserRepository.existUserWithPhoneNumber(phoneNumber);
  }
}

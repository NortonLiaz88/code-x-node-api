import { UpdateUserRepository } from 'src/data/protocols/db/user/db-update-user-repository';
import { UserModel } from 'src/domain/models/user';
import { UpdateUser } from 'src/domain/usecases/user/update-user/update-user';

export class DbUpdateUser implements UpdateUser {
  constructor(private readonly updateUserRepository: UpdateUserRepository) {}

  async update(id: number, user: UserModel): Promise<UserModel> {
    return await this.updateUserRepository.updateUser(id, user);
  }

  async isEditableUser(id: number): Promise<boolean> {
    return await this.updateUserRepository.isEditableUser(id);
  }
}

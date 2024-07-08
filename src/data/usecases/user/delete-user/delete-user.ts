import { DeleteUserRepository } from 'src/data/protocols/db/user/db-delete-user-repository';
import { DeleteUser } from 'src/domain/usecases/user/delete-user/delete-user';

export class DbDeleteUser implements DeleteUser {
  constructor(private readonly deleteUserRepository: DeleteUserRepository) {}

  async deleteUser(id: number): Promise<void> {
    return await this.deleteUserRepository.deleteUser(id);
  }

  async isRemovableUser(id: number): Promise<boolean> {
    return await this.deleteUserRepository.isRemovableUser(id);
  }
}

import { GetUserByIdRepository } from 'src/data/protocols/db/user/db-get-user-by-id-repository';
import { UserModel } from 'src/domain/models/user';
import { GetUserById } from 'src/domain/usecases/user/get-user/get-user-by-id';

export class DbGetUserById implements GetUserById {
  constructor(private readonly getUserByIdRepository: GetUserByIdRepository) {}

  getById(id: number): Promise<UserModel> {
    return this.getUserByIdRepository.getById(id);
  }
}

import { GetUserModel } from 'src/domain/models/user';
import { AddUserModel } from 'src/domain/usecases/user/add-user/add-user';

export class AddUserRepository {
  add: (user: AddUserModel) => Promise<GetUserModel>;
}

import { User } from 'src/domain/models/user';
import { AddUserModel } from 'src/domain/usecases/user/add-user';

export class AddUserRepository {
  add: (user: AddUserModel) => Promise<User>;
}

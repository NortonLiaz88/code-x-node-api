import { UserModel } from 'src/domain/models/user';

export interface GetAccountByUsernameRepository {
  getByUsername: (username: string) => Promise<UserModel | null>;
}

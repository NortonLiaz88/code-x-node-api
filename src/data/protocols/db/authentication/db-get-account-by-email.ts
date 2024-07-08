import { UserModel } from 'src/domain/models/user';

export interface GetAccountByEmailRepository {
  getByEmail: (email: string) => Promise<UserModel | null>;
}

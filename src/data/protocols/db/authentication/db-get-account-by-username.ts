import { User } from 'src/domain/models/user';

export interface GetAccountByUsernameRepository {
  getByUsername: (username: string) => Promise<User | null>;
}

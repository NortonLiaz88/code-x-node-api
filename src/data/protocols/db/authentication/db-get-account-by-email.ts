import { User } from 'src/domain/models/user';

export interface GetAccountByEmailRepository {
  getByEmail: (email: string) => Promise<User | null>;
}

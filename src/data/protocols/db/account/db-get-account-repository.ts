import { User } from '@prisma/client';

export interface GetAccountByIdRepository {
  getById: (id: number) => Promise<User | null>;
}

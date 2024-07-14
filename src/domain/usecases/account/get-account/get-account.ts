import { User } from '@prisma/client';

export interface GetAccountById {
  getById: (id: number) => Promise<User>;
}

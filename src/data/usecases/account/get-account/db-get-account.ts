import { User } from '@prisma/client';
import { GetAccountByIdRepository } from '../../../../data/protocols/db/account/db-get-account-repository';
import { GetAccountById } from 'src/domain/usecases/account/get-account/get-account';

export class DbGetAccountById implements GetAccountByIdRepository {
  constructor(
    private readonly getAccount: GetAccountById,

  ) {}

  async getById(id: number): Promise<User> {
    const accountById = await this.getAccount.getById(
     id,
    );
   
    return accountById;
  }
}

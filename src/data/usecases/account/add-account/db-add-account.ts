import { HttpException } from '@nestjs/common';
import { Encrypter } from '../../../../data/protocols/cryptography/encrypter';
import { AddAccountRepository } from '../../../../data/protocols/db/account/db-add-account-repository';
import { GetAccountByEmailRepository } from '../../../../data/protocols/db/authentication/db-get-account-by-email';
import { GetAccountByUsernameRepository } from '../../../../data/protocols/db/authentication/db-get-account-by-username';
import {
  AddAccount,
  AddAccountModel,
} from 'src/domain/usecases/account/add-account/add-account';

export class DbAddAccount implements AddAccount {
  constructor(
    private readonly addAccountRepository: AddAccountRepository,
    private readonly loadAccountByEmailRepository: GetAccountByEmailRepository,
    private readonly loadAccountByNameRepository: GetAccountByUsernameRepository,
    private readonly encrypter: Encrypter,
  ) {}

  async add(data: AddAccountModel): Promise<void> {
    const accountByEmail = await this.loadAccountByEmailRepository.getByEmail(
      data.email,
    );
    const accountByName = await this.loadAccountByNameRepository.getByUsername(
      data.username,
    );

    if (accountByEmail || accountByName) {
      throw new HttpException('User already exists', 409);
    }
    const { name,
      lastName,
      password,
      username,
      phoneNumber,
      profile,
      email } = data;

    const hashedPassword = await this.encrypter.encrypt(password);

    await this.addAccountRepository.add({
      name,
      lastName,
      username,
      phoneNumber,
      email,
      profile,
      password: hashedPassword,
    });
  }
}

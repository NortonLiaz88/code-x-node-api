import { HttpException } from '@nestjs/common';
import { GetUserModel, UserModel } from 'src/domain/models/user';
import { AddUser, AddUserModel } from 'src/domain/usecases/user/add-user/add-user';

import { AddUserRepository } from '../../../protocols/db/user/db-add-user-repository';
import { Encrypter } from '../../../protocols/cryptography/encrypter';
import { GetAccountByEmailRepository } from '../../../protocols/db/authentication/db-get-account-by-email';
import { GetAccountByUsernameRepository } from '../../../protocols/db/authentication/db-get-account-by-username';

export class DbAddUser implements AddUser {
  constructor(
    private readonly encrypter: Encrypter,
    private readonly addAccountRepository: AddUserRepository,
    private readonly loadAccountByEmailRepository: GetAccountByEmailRepository,
    private readonly loadAccountByNameRepository: GetAccountByUsernameRepository,
  ) {}

  async add(data: AddUserModel): Promise<GetUserModel> {
    const accountByEmail = await this.loadAccountByEmailRepository.getByEmail(
      data.email,
    );
    const accountByName = await this.loadAccountByNameRepository.getByUsername(
      data.username,
    );

    if (accountByEmail || accountByName) {
      console.log('User already exists ==>', accountByEmail, accountByName);
      throw new HttpException('User already exists', 409);
    }
    const { email, lastName, name, password, phoneNumber, username, profile } =
      data;

    const hashedPassword = await this.encrypter.encrypt(password);

    console.log('hashedPassword ==>', hashedPassword);
    console.log('data ==>', data); 
    const result = await this.addAccountRepository.add({
      email,
      lastName,
      name,
      password: hashedPassword,
      phoneNumber,
      username,
      profile,
    });

    return result;
  }
}

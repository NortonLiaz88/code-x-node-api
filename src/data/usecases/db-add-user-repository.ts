import { AddUser, AddUserModel } from 'src/domain/usecases/user/add-user';
import { AddUserRepository } from '../protocols/db/user/add-user-repository';
import { Encrypter } from '../protocols/cryptography/encrypter';
import { GetAccountByEmailRepository } from '../protocols/db/authentication/db-get-account-by-email';
import { GetAccountByUsernameRepository } from '../protocols/db/authentication/db-get-account-by-username';
import { User } from 'src/domain/models/user';
import { HttpException } from '@nestjs/common';

export class DbAddUser implements AddUser {
  constructor(
    private readonly encrypter: Encrypter,
    private readonly addAccountRepository: AddUserRepository,
    private readonly loadAccountByEmailRepository: GetAccountByEmailRepository,
    private readonly loadAccountByNameRepository: GetAccountByUsernameRepository,
  ) {}

  async add(data: AddUserModel): Promise<User> {
    const accountByEmail = await this.loadAccountByEmailRepository.getByEmail(
      data.email,
    );
    const accountByName = await this.loadAccountByNameRepository.getByUsername(
      data.username,
    );

    if (accountByEmail || accountByName) {
      throw new HttpException('User already exists', 409);
    }
    const { email, lastName, name, password, phoneNumber, username, profile } =
      data;

    const hashedPassword = await this.encrypter.encrypt(password);

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
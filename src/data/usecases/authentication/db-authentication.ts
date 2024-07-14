import {
  Authentication,
  AuthenticationModel,
} from 'src/domain/usecases/authentication/authentication';
import { GetAccountByEmailRepository } from '../../protocols/db/authentication/db-get-account-by-email';
import { HashComparer } from '../../../data/protocols/cryptography/hash-comparer';
import { TokenGenerator } from '../../../data/protocols/cryptography/token-generator';
import { HttpException } from '@nestjs/common';
import { AuthToken } from 'src/domain/models/auth-token';

export class DbAuthentication implements Authentication {
  constructor(
    private readonly loadAccountByEmailRepository: GetAccountByEmailRepository,
    private readonly hashComparer: HashComparer,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async auth(authentication: AuthenticationModel): Promise<AuthToken | null> {
    const account = await this.loadAccountByEmailRepository.getByEmail(
      authentication.email,
    );
    if (account) {
      console.log('account', account);

      const isValid = await this.hashComparer.compare(
        authentication.password,
        account?.password,
      );


      console.log('isValid', account.password, authentication.password, isValid);

      const { id, name, lastName, email, profile } = account;
      if (isValid) {
        const accessToken = await this.tokenGenerator.generate({
          id,
          name,
          lastName,
          email,
          profile,
        });
        return accessToken;
      }
    }
    throw new HttpException('User does not exist ', 404);
  }
}

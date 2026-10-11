import { HttpException } from '@nestjs/common';
import { DbAuthentication } from './db-authentication';
import { GetAccountByEmailRepository } from '../../protocols/db/authentication/db-get-account-by-email';
import { HashComparer } from '../../protocols/cryptography/hash-comparer';
import { TokenGenerator } from '../../protocols/cryptography/token-generator';
import { GetUserModel } from 'src/domain/models/user';

const account = {
  id: 1,
  name: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  password: 'hashed',
} as GetUserModel;

const makeSut = () => {
  const repository: jest.Mocked<GetAccountByEmailRepository> = {
    getByEmail: jest.fn().mockResolvedValue(account),
  };
  const hashComparer: jest.Mocked<HashComparer> = {
    compare: jest.fn().mockResolvedValue(true),
  };
  const tokenGenerator: jest.Mocked<TokenGenerator> = {
    generate: jest
      .fn()
      .mockResolvedValue({ token: 'access', refreshToken: 'refresh' }),
  };
  const sut = new DbAuthentication(repository, hashComparer, tokenGenerator);
  return { sut, repository, hashComparer, tokenGenerator };
};

describe('DbAuthentication', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('returns tokens for a valid email and password', async () => {
    const { sut, hashComparer, tokenGenerator } = makeSut();

    const result = await sut.auth({
      email: account.email,
      password: 'secret',
    });

    expect(result).toEqual({ token: 'access', refreshToken: 'refresh' });
    expect(hashComparer.compare).toHaveBeenCalledWith('secret', 'hashed');
    expect(tokenGenerator.generate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, email: account.email }),
    );
  });

  it('does not put the password hash in the token payload', async () => {
    const { sut, tokenGenerator } = makeSut();

    await sut.auth({ email: account.email, password: 'secret' });

    expect(tokenGenerator.generate.mock.calls[0][0]).not.toHaveProperty(
      'password',
    );
  });

  it('rejects a wrong password', async () => {
    const { sut, hashComparer, tokenGenerator } = makeSut();
    hashComparer.compare.mockResolvedValue(false);

    await expect(
      sut.auth({ email: account.email, password: 'wrong' }),
    ).rejects.toBeInstanceOf(HttpException);
    expect(tokenGenerator.generate).not.toHaveBeenCalled();
  });

  it('rejects an unknown email', async () => {
    const { sut, repository, hashComparer } = makeSut();
    repository.getByEmail.mockResolvedValue(null);

    await expect(
      sut.auth({ email: 'nobody@example.com', password: 'secret' }),
    ).rejects.toBeInstanceOf(HttpException);
    expect(hashComparer.compare).not.toHaveBeenCalled();
  });
});

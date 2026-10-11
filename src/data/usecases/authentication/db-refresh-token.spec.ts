import { UnauthorizedException } from '@nestjs/common';
import { DbRefreshToken } from './db-refresh-token';
import { GetUserModel } from 'src/domain/models/user';

const account = {
  id: 3,
  name: 'Grace',
  lastName: 'Hopper',
  email: 'grace@example.com',
  password: 'hashed',
  profile: { id: 9 },
} as unknown as GetUserModel;

const makeSut = () => {
  const tokenDecoder = {
    decode: jest
      .fn()
      .mockResolvedValue({ payload: { email: account.email }, iat: '0' }),
  };
  const tokenInspector = { verify: jest.fn().mockResolvedValue(true) };
  const tokenGenerator = {
    generate: jest.fn().mockResolvedValue({ token: 'a', refreshToken: 'r' }),
  };
  const repository = { getByEmail: jest.fn().mockResolvedValue(account) };
  const sut = new DbRefreshToken(
    tokenDecoder,
    tokenInspector,
    tokenGenerator,
    repository,
  );
  return { sut, tokenInspector, tokenGenerator };
};

describe('DbRefreshToken', () => {
  it('issues new tokens with the same payload as login', async () => {
    const { sut, tokenGenerator } = makeSut();

    await expect(sut.refresh('refresh')).resolves.toEqual({
      token: 'a',
      refreshToken: 'r',
    });
    expect(tokenGenerator.generate).toHaveBeenCalledWith({
      id: 3,
      name: 'Grace',
      lastName: 'Hopper',
      email: account.email,
      profile: { id: 9 },
    });
  });

  it('rejects a token the inspector does not accept', async () => {
    const { sut, tokenInspector, tokenGenerator } = makeSut();
    tokenInspector.verify.mockResolvedValue(false);

    await expect(sut.refresh('access')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(tokenGenerator.generate).not.toHaveBeenCalled();
  });
});

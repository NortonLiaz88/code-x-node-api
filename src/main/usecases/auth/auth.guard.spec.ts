import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { TokenGeneratorAdapter } from 'src/infra/cryptography/token-generator';

const contextWith = (authorization?: string) => {
  const request = { headers: { authorization } };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
  return { context, request };
};

describe('AuthGuard', () => {
  const jwtService = new JwtService();
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const guard = new AuthGuard(jwtService, reflector);
  const generator = new TokenGeneratorAdapter(jwtService);

  beforeAll(() => {
    process.env.JWT_SECRET_KEY = 'access-secret';
    process.env.JWT_REFRESH_SECRET_KEY = 'refresh-secret';
  });

  it('lets an access token through and sets request.user', async () => {
    const { token } = await generator.generate({ id: 7 });
    const { context, request } = contextWith(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request['user']).toMatchObject({ payload: { id: 7 } });
  });

  it('returns 401 for a refresh token on a protected route', async () => {
    const { refreshToken } = await generator.generate({ id: 7 });
    const { context } = contextWith(`Bearer ${refreshToken}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns 401 for a token signed with the old shared payload and no type', async () => {
    const token = await jwtService.signAsync(
      { payload: { id: 7 } },
      { secret: 'access-secret' },
    );
    const { context } = contextWith(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns 401 without a token', async () => {
    const { context } = contextWith(undefined);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

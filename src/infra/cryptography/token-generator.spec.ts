import { JwtService } from '@nestjs/jwt';
import { TokenGeneratorAdapter } from './token-generator';
import { TokenInspectorAdapter } from './token-inspector';

describe('TokenGeneratorAdapter', () => {
  const jwtService = new JwtService();
  const generator = new TokenGeneratorAdapter(jwtService);
  const inspector = new TokenInspectorAdapter(jwtService);

  beforeAll(() => {
    process.env.JWT_SECRET_KEY = 'access-secret';
    process.env.JWT_REFRESH_SECRET_KEY = 'refresh-secret';
  });

  it('signs the access and refresh tokens with different secrets and types', async () => {
    const { token, refreshToken } = await generator.generate({ id: 1 });

    const access = await jwtService.verifyAsync(token, {
      secret: 'access-secret',
    });
    const refresh = await jwtService.verifyAsync(refreshToken, {
      secret: 'refresh-secret',
    });

    expect(access).toMatchObject({ type: 'access', payload: { id: 1 } });
    expect(refresh).toMatchObject({ type: 'refresh', payload: { id: 1 } });
    await expect(
      jwtService.verifyAsync(refreshToken, { secret: 'access-secret' }),
    ).rejects.toThrow();
  });

  it('accepts a refresh token at the refresh endpoint', async () => {
    const { refreshToken } = await generator.generate({ id: 1 });

    await expect(inspector.verify(refreshToken)).resolves.toBe(true);
  });

  it('rejects an access token at the refresh endpoint', async () => {
    const { token } = await generator.generate({ id: 1 });

    await expect(inspector.verify(token)).resolves.toBe(false);
  });

  it('rejects garbage at the refresh endpoint without throwing', async () => {
    await expect(inspector.verify('not-a-jwt')).resolves.toBe(false);
  });
});

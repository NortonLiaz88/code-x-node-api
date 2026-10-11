import { JwtService } from '@nestjs/jwt';
import { TokenInspector } from '../../data/protocols/cryptography/token-inspector';
import { REFRESH_TOKEN, refreshTokenSecret } from './token-type';

// Verifies refresh tokens only: an access token fails both the secret and
// the type check.
export class TokenInspectorAdapter implements TokenInspector {
  constructor(private readonly jwtService: JwtService) {}

  async verify(value: string): Promise<boolean> {
    try {
      const decoded = await this.jwtService.verifyAsync(value, {
        secret: refreshTokenSecret(),
      });
      return decoded?.type === REFRESH_TOKEN;
    } catch {
      return false;
    }
  }
}

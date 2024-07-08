import { JwtService } from '@nestjs/jwt';
import { TokenInspector } from '../../data/protocols/cryptography/token-inspector';

export class TokenInspectorAdapter implements TokenInspector {
  constructor(private readonly jwtService: JwtService) {}

  async verify(value: string): Promise<boolean> {
    const isValid = await this.jwtService.verify(value, {
      secret: process.env.JWT_SECRET_KEY,
    });

    return !!isValid;
  }
}

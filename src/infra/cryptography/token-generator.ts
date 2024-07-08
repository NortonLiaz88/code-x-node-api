import { JwtService } from '@nestjs/jwt';
import { TokenGenerator } from '../../data/protocols/cryptography/token-generator';
import { AuthToken } from 'src/domain/models/auth-token';

export class TokenGeneratorAdapter implements TokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async generate(payload: string | object): Promise<AuthToken> {
    const token = await this.jwtService.signAsync(
      { payload },
      {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: '1h',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { payload },
      {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: '1d',
      },
    );

    return { token, refreshToken };
  }
}

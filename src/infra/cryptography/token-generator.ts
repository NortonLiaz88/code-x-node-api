import { JwtService } from '@nestjs/jwt';
import { TokenGenerator } from '../../data/protocols/cryptography/token-generator';
import { AuthToken } from 'src/domain/models/auth-token';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  accessTokenSecret,
  refreshTokenSecret,
} from './token-type';

export class TokenGeneratorAdapter implements TokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async generate(payload: string | object): Promise<AuthToken> {
    const token = await this.jwtService.signAsync(
      { payload, type: ACCESS_TOKEN },
      {
        secret: accessTokenSecret(),
        expiresIn: '1h',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { payload, type: REFRESH_TOKEN },
      {
        secret: refreshTokenSecret(),
        expiresIn: '1d',
      },
    );

    return { token, refreshToken };
  }
}

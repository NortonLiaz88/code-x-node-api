import { JwtService } from '@nestjs/jwt';
import { TokenDecoder } from '../../data/protocols/cryptography/token-decoder';
import { JwtTokenContent } from 'src/domain/models/auth-token';

export class TokenDecoderAdapter implements TokenDecoder {
  constructor(private readonly jwtService: JwtService) {}
  async decode(value: string): Promise<JwtTokenContent> {
    const decodedToken = this.jwtService.decode(value) as JwtTokenContent;
    return decodedToken;
  }
}

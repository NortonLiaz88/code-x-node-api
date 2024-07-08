import { JwtTokenContent } from 'src/domain/models/auth-token';

export interface TokenDecoder {
  decode: (value: string) => Promise<JwtTokenContent | null>;
}

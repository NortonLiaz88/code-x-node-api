import { AuthToken } from 'src/domain/models/auth-token';

export interface TokenGenerator {
  generate: (value: string | object) => Promise<AuthToken | null>;
}

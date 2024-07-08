import { AuthToken } from 'src/domain/models/auth-token';

export interface RefreshToken {
  refresh: (refreshToken: string) => Promise<AuthToken | null>;
}

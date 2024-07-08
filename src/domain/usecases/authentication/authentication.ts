import { AuthToken } from 'src/domain/models/auth-token';

export interface AuthenticationModel {
  email: string;
  password: string;
}

export interface Authentication {
  auth: (authentication: AuthenticationModel) => Promise<AuthToken | null>;
}

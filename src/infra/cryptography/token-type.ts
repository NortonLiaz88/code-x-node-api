export const ACCESS_TOKEN = 'access';
export const REFRESH_TOKEN = 'refresh';

export type TokenType = typeof ACCESS_TOKEN | typeof REFRESH_TOKEN;

export const accessTokenSecret = () => process.env.JWT_SECRET_KEY;
export const refreshTokenSecret = () => process.env.JWT_REFRESH_SECRET_KEY;

export const assertTokenSecrets = () => {
  if (!accessTokenSecret() || !refreshTokenSecret()) {
    throw new Error('JWT_SECRET_KEY and JWT_REFRESH_SECRET_KEY must be set');
  }
  if (accessTokenSecret() === refreshTokenSecret()) {
    throw new Error('JWT_REFRESH_SECRET_KEY must differ from JWT_SECRET_KEY');
  }
};

export interface AuthToken {
  token: string;
  refreshToken: string;
}

export interface JwtTokenContent {
  payload: {
    id: number;
    name: string;
    email: string;
    profile: any;
  };
  iat: string;
}

/**
 * Requests per client IP per minute. Behind a reverse proxy, set TRUST_PROXY
 * so the IP is the client's and not the proxy's (see src/main.ts).
 */
const MINUTE_MS = 60_000;

export const RATE_LIMIT_MESSAGE =
  'Muitas tentativas em pouco tempo. Espere um minuto e tente de novo.';

/** Every route unless it says otherwise. */
export const DEFAULT_RATE_LIMIT = { limit: 300, ttl: MINUTE_MS };

/** Login, sign-up and password reset: slows down password guessing. */
export const AUTH_RATE_LIMIT = { default: { limit: 10, ttl: MINUTE_MS } };

/** Questions to the tutor: each one costs a model call. */
export const TUTOR_RATE_LIMIT = { default: { limit: 20, ttl: MINUTE_MS } };

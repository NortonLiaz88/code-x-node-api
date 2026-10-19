/** Browser origins allowed to call the API, from CORS_ORIGINS (comma separated). */
export const corsOrigins = (env = process.env): string[] =>
  (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

/**
 * Express "trust proxy" from TRUST_PROXY: a hop count ("1" behind one reverse
 * proxy) or false when unset, so client IPs can't be spoofed with headers.
 */
export const trustProxy = (env = process.env): number | false => {
  const hops = Number(env.TRUST_PROXY);
  return Number.isInteger(hops) && hops > 0 ? hops : false;
};

const positiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const resetConfig = (env = process.env) => ({
  // How long a reset link works.
  ttlMinutes: positiveInt(env.RESET_TOKEN_TTL_MINUTES, 30),
  // The app opens this link; the token is added as ?token=.
  linkBase: env.RESET_PASSWORD_URL || 'codex://reset-password',
});

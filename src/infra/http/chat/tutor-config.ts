export interface TutorConfig {
  url: string;
  /**
   * How long to wait for the tutor: the whole answer for /response, or the
   * silence between two events for /response/stream.
   */
  timeoutMs: number;
  /** Pause before the one retry when the tutor can't be reached. */
  retryDelayMs: number;
}

export const DEFAULT_TUTOR_TIMEOUT_MS = 120_000;

export const tutorConfig = (env = process.env): TutorConfig => {
  const timeout = Number(env.TUTOR_TIMEOUT_MS);
  return {
    url: env.TUTOR_URL ?? '',
    timeoutMs:
      Number.isFinite(timeout) && timeout > 0
        ? timeout
        : DEFAULT_TUTOR_TIMEOUT_MS,
    retryDelayMs: 500,
  };
};

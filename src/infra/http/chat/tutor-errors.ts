import { isAxiosError } from 'axios';
import {
  TutorFailure,
  TutorUnavailableError,
} from 'src/data/protocols/db/chat/db-send-message-repository';

// The request never reached the tutor, so asking again can't answer twice.
const NOT_CONNECTED = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EHOSTUNREACH',
  'ENETUNREACH',
]);

const TIMED_OUT = new Set(['ECONNABORTED', 'ETIMEDOUT']);

export const toTutorError = (err: unknown): TutorUnavailableError => {
  if (err instanceof TutorUnavailableError) return err;
  const code = (err as { code?: string })?.code ?? '';
  let reason: TutorFailure = 'failed';
  if (NOT_CONNECTED.has(code)) reason = 'unreachable';
  else if (TIMED_OUT.has(code)) reason = 'timeout';
  else if (isAxiosError(err) && !err.response && !code) reason = 'unreachable';
  return new TutorUnavailableError(reason, err);
};

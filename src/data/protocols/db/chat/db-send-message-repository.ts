import {
  TutorReply,
  TutorScenario,
} from 'src/main/dto/chat/chat-reply/chat-reply.dto';

export class SendMessageRepository {
  sendMessage: (
    profileId: number,
    referenceId: string,
    message: string,
    scenario?: TutorScenario,
  ) => Promise<TutorReply>;

  streamMessage: (
    referenceId: string,
    message: string,
    signal?: AbortSignal,
    scenario?: TutorScenario,
  ) => AsyncGenerator<TutorStreamEvent>;
}

export type TutorStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; reply: TutorReply }
  | { type: 'error' };

/**
 * Why the tutor gave no answer: it could not be reached (even after a
 * retry), it took longer than TUTOR_TIMEOUT_MS, or it answered with an error.
 */
export type TutorFailure = 'unreachable' | 'timeout' | 'failed';

export class TutorUnavailableError extends Error {
  constructor(
    readonly reason: TutorFailure,
    readonly cause?: unknown,
  ) {
    super(`Tutor ${reason}`);
    this.name = 'TutorUnavailableError';
  }
}

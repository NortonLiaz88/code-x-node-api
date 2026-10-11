import { TutorReply } from 'src/main/dto/chat/chat-reply/chat-reply.dto';

export class SendMessageRepository {
  sendMessage: (
    profileId: number,
    referenceId: string,
    message: string,
  ) => Promise<TutorReply>;

  streamMessage: (
    referenceId: string,
    message: string,
    signal?: AbortSignal,
  ) => AsyncGenerator<TutorStreamEvent>;
}

export type TutorStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; reply: TutorReply }
  | { type: 'error' };

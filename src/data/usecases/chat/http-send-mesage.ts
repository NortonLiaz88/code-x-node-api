import {
  SendMessageRepository,
  TutorUnavailableError,
} from 'src/data/protocols/db/chat/db-send-message-repository';
import {
  SendMessage,
  TutorAnswer,
} from 'src/domain/usecases/chat/send-message/send-message';
import {
  ChatReplyDto,
  ChatStreamEvent,
  STREAM_ERROR_MESSAGE,
  TutorPick,
  tutorMeta,
} from 'src/main/dto/chat/chat-reply/chat-reply.dto';
import {
  TUTOR_UNAVAILABLE_MESSAGES,
  TutorUnavailableException,
} from 'src/main/dto/chat/tutor-unavailable.dto';

export class RemoteSendMessage implements SendMessage {
  constructor(private readonly sendMessageRemote: SendMessageRepository) {}

  async sendMessage(
    profileId: number,
    chatId: string,
    message: string,
    pick: TutorPick = {},
  ): Promise<TutorAnswer> {
    try {
      const reply = await this.sendMessageRemote.sendMessage(
        profileId,
        chatId,
        message,
        pick,
      );
      return { reply: ChatReplyDto.fromTutor(reply), meta: tutorMeta(reply) };
    } catch (err) {
      // A typed 503 the app can show as is.
      if (err instanceof TutorUnavailableError) {
        throw new TutorUnavailableException(err.reason);
      }
      throw err;
    }
  }

  /** The tutor's stream as the app sees it; always ends with done or error. */
  async *streamMessage(
    chatId: string,
    message: string,
    signal?: AbortSignal,
    pick: TutorPick = {},
  ): AsyncGenerator<ChatStreamEvent> {
    try {
      for await (const item of this.sendMessageRemote.streamMessage(
        chatId,
        message,
        signal,
        pick,
      )) {
        if (item.type === 'delta') {
          yield { event: 'delta', data: { text: item.text } };
        } else if (item.type === 'done') {
          yield {
            event: 'done',
            data: ChatReplyDto.fromTutor(item.reply),
            meta: tutorMeta(item.reply),
          };
          return;
        } else {
          break;
        }
      }
    } catch (err) {
      if (signal?.aborted) return;
      if (err instanceof TutorUnavailableError) {
        yield {
          event: 'error',
          data: {
            message: TUTOR_UNAVAILABLE_MESSAGES[err.reason],
            reason: err.reason,
          },
        };
        return;
      }
    }
    yield { event: 'error', data: { message: STREAM_ERROR_MESSAGE } };
  }
}

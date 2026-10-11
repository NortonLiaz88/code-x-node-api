import { SendMessageRepository } from 'src/data/protocols/db/chat/db-send-message-repository';
import { SendMessage } from 'src/domain/usecases/chat/send-message/send-message';
import {
  ChatReplyDto,
  ChatStreamEvent,
  STREAM_ERROR_MESSAGE,
} from 'src/main/dto/chat/chat-reply/chat-reply.dto';

export class RemoteSendMessage implements SendMessage {
  constructor(private readonly sendMessageRemote: SendMessageRepository) {}

  async sendMessage(
    profileId: number,
    chatId: string,
    message: string,
  ): Promise<ChatReplyDto> {
    const reply = await this.sendMessageRemote.sendMessage(
      profileId,
      chatId,
      message,
    );
    return ChatReplyDto.fromTutor(reply);
  }

  /** The tutor's stream as the app sees it; always ends with done or error. */
  async *streamMessage(
    chatId: string,
    message: string,
    signal?: AbortSignal,
  ): AsyncGenerator<ChatStreamEvent> {
    try {
      for await (const item of this.sendMessageRemote.streamMessage(
        chatId,
        message,
        signal,
      )) {
        if (item.type === 'delta') {
          yield { event: 'delta', data: { text: item.text } };
        } else if (item.type === 'done') {
          yield { event: 'done', data: ChatReplyDto.fromTutor(item.reply) };
          return;
        } else {
          break;
        }
      }
    } catch (err) {
      if (signal?.aborted) return;
    }
    yield { event: 'error', data: { message: STREAM_ERROR_MESSAGE } };
  }
}

import { SendMessageRepository } from 'src/data/protocols/db/chat/db-send-message-repository';
import { SendMessage } from 'src/domain/usecases/chat/send-message/send-message';
import { ChatReplyDto } from 'src/main/dto/chat/chat-reply/chat-reply.dto';

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
}

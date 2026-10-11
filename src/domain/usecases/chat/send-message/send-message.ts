import { ChatReplyDto } from 'src/main/dto/chat/chat-reply/chat-reply.dto';

export interface SendMessage {
  sendMessage(
    profileId: number,
    chatId: string,
    message: string,
  ): Promise<ChatReplyDto>;
}

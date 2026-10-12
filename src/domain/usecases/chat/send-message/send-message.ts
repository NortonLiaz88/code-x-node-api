import {
  ChatReplyDto,
  TutorMeta,
} from 'src/main/dto/chat/chat-reply/chat-reply.dto';

export interface TutorAnswer {
  reply: ChatReplyDto;
  meta: TutorMeta;
}

export interface SendMessage {
  sendMessage(
    profileId: number,
    chatId: string,
    message: string,
  ): Promise<TutorAnswer>;
}

import {
  ChatReplyDto,
  TutorMeta,
  TutorPick,
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
    pick?: TutorPick,
  ): Promise<TutorAnswer>;
}

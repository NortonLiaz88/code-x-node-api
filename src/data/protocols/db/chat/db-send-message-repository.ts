import { TutorReply } from 'src/main/dto/chat/chat-reply/chat-reply.dto';

export class SendMessageRepository {
  sendMessage: (
    profileId: number,
    referenceId: string,
    message: string,
  ) => Promise<TutorReply>;
}

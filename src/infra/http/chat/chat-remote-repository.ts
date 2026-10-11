import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SendMessageRepository } from 'src/data/protocols/db/chat/db-send-message-repository';
import { TutorReply } from 'src/main/dto/chat/chat-reply/chat-reply.dto';

interface TutorResponse {
  messages?: TutorReply[];
}

export class ChatRemoteRepository implements SendMessageRepository {
  constructor(private readonly http: HttpService) {}

  async sendMessage(
    profileId: number,
    referenceId: string,
    message: string,
  ): Promise<TutorReply> {
    const response = await firstValueFrom(
      this.http.post<TutorResponse>(`${process.env.TUTOR_URL}/response`, {
        session_id: referenceId,
        message,
      }),
    );
    // The tutor answers with { messages: [reply] }.
    return response.data?.messages?.[0];
  }
}

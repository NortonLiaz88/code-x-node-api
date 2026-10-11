import { HttpService } from '@nestjs/axios';
import { Readable } from 'stream';
import { firstValueFrom } from 'rxjs';
import {
  SendMessageRepository,
  TutorStreamEvent,
} from 'src/data/protocols/db/chat/db-send-message-repository';
import { TutorReply } from 'src/main/dto/chat/chat-reply/chat-reply.dto';
import { parseSse } from './sse';

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

  /** Reads the tutor's SSE stream (POST /response/stream). */
  async *streamMessage(
    referenceId: string,
    message: string,
    signal?: AbortSignal,
  ): AsyncGenerator<TutorStreamEvent> {
    const response = await this.http.axiosRef.post<Readable>(
      `${process.env.TUTOR_URL}/response/stream`,
      { session_id: referenceId, message },
      { responseType: 'stream', signal, timeout: 0 },
    );

    for await (const { event, data } of parseSse(response.data)) {
      const payload = JSON.parse(data);
      if (event === 'delta') yield { type: 'delta', text: payload.text ?? '' };
      else if (event === 'done') yield { type: 'done', reply: payload };
      else if (event === 'error') yield { type: 'error' };
    }
  }
}

import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { SendMessageRepository } from "src/data/protocols/db/chat/db-send-message-repository";

export class ChatRemoteRepository implements SendMessageRepository {
  constructor(private readonly http: HttpService) {}

  async sendMessage(profileId: number, referenceId: string, message: string): Promise<ChatModel> {
    const response = await firstValueFrom(this.http.post<ChatModel>(`http://195.200.7.68:8001/response`, { session_id: referenceId, message }));
    return response.data;
  }
}
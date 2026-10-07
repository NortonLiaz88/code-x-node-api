import { StartSessionRepository } from "src/data/protocols/db/chat/db-start-session-repository";
import { StartSession } from "src/domain/usecases/chat/start-session/start-sesseion";

export class DbStartSession implements StartSession {
  constructor(private readonly startSessionRepository: StartSessionRepository) {}

  async startSession(profileId: number, referenceId?: string): Promise<ChatModel> {
    return await this.startSessionRepository.startSession(profileId, referenceId);
  }
}

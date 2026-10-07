export class StartSessionRepository {
    startSession: (profileId: number, referenceId?: string) => Promise<ChatModel>;
}
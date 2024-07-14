export class SendMessageRepository {
    startSession: (profileId: number, referenceId: string, message: string) => Promise<ChatModel>;
}
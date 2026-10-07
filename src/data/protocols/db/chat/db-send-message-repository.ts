export class SendMessageRepository {
    sendMessage: (profileId: number, referenceId: string, message: string) => Promise<ChatModel>;
}
export class HttpSendMessage {
    startSession: (profileId: number, referenceId: string, message: string) => Promise<ChatModel>;
}
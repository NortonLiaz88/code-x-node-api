export interface SendMessage {
    sendMessage(profileId: number, chatId: string, message: string): Promise<void>;
}
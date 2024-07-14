export interface SendMessage {
    sendMessage(profileId: number, chatId: number, message: string): Promise<void>;
}
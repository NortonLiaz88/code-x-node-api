import { SendMessageRepository } from "src/data/protocols/db/chat/db-send-message-repository";
import { SendMessage } from "src/domain/usecases/chat/send-message/send-message";

export class RemoteSendMessage implements SendMessage {
    constructor(
        private readonly sendMessageRemote: SendMessageRepository
    ) {}

    async sendMessage(profileId: number, chatId: string, message: string): Promise<void> {
        await this.sendMessageRemote.sendMessage(profileId, chatId, message);
    }
}
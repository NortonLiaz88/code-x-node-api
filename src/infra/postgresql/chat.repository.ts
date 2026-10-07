import { PrismaClientService } from "../orm/prisma/prisma-client.service";

export class ChatPostgresRepository {
    constructor(private readonly ormService: PrismaClientService) { }

    async startSession(profileId: number, referenceId?: string): Promise<ChatModel> {
        const chat = await this.ormService.chat.create({
            data: {
                profileId: profileId,
                referenceId: referenceId,
            }
        });

        return chat;
    }

    async getChatById(chatId: number): Promise<ChatModel> {
        const chat = await this.ormService.chat.findUnique({
            where: {
                id: chatId
            }
        });

        return chat;
    }

    async getChatsByProfileId(profileId: number): Promise<ChatModel[]> {
        const chats = await this.ormService.chat.findMany({
            where: {
                profileId: profileId
            }
        });

        return chats;
    }
}
import { PrismaClientService } from '../orm/prisma/prisma-client.service';

export class ChatPostgresRepository {
  constructor(private readonly ormService: PrismaClientService) {}

  async startSession(
    profileId: number,
    referenceId?: string,
  ): Promise<ChatModel> {
    const chat = await this.ormService.chat.create({
      data: {
        profileId: profileId,
        referenceId: referenceId,
      },
    });

    return chat;
  }

  async getChatById(chatId: number): Promise<ChatModel> {
    const chat = await this.ormService.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    return chat;
  }

  async getChatsByProfileId(profileId: number): Promise<ChatModel[]> {
    const chats = await this.ormService.chat.findMany({
      where: {
        profileId: profileId,
      },
    });

    return chats;
  }

  async getChatByReference(
    profileId: number,
    referenceId: string,
  ): Promise<ChatModel | null> {
    return this.ormService.chat.findFirst({
      where: { profileId, referenceId },
    });
  }

  /** Conversations with at least one message, most recent first. */
  async getConversations(profileId: number): Promise<ChatModel[]> {
    return this.ormService.chat.findMany({
      where: { profileId, lastMessageAt: { not: null } },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  /** Records a new message; the first topic the tutor gives is kept. */
  async recordMessage(chat: ChatModel, topic?: string): Promise<void> {
    await this.ormService.chat.update({
      where: { id: chat.id },
      data: {
        lastMessageAt: new Date(),
        ...(!chat.topic && topic && { topic }),
      },
    });
  }
}

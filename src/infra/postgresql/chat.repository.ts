import { Prisma } from '@prisma/client';
import { PrismaClientService } from '../orm/prisma/prisma-client.service';

export interface StoredChatReply {
  id: number;
  answer: string | null;
  quickReplies: string[];
  topic: string | null;
  createdAt: Date;
}

export type ReplyReservation =
  | { reservationId: number }
  | { existing: StoredChatReply };

// A reservation nobody finished (the API restarted mid-answer) is taken over
// after this long, so the question can still be answered.
export const STALE_RESERVATION_MS = 2 * 60 * 1000;

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

  /**
   * Claims a clientMessageId for this chat. The first caller gets a
   * reservation; later callers get the stored reply (answer null while the
   * tutor is still answering).
   */
  async reserveReply(
    chatId: number,
    clientMessageId: string,
  ): Promise<ReplyReservation> {
    const where = { chatId_clientMessageId: { chatId, clientMessageId } };
    let existing = await this.ormService.chatReply.findUnique({ where });
    if (!existing) {
      try {
        const created = await this.ormService.chatReply.create({
          data: { chatId, clientMessageId },
        });
        return { reservationId: created.id };
      } catch (err) {
        // Another request claimed the same id between the read and the insert.
        if (
          !(err instanceof Prisma.PrismaClientKnownRequestError) ||
          err.code !== 'P2002'
        ) {
          throw err;
        }
        existing = await this.ormService.chatReply.findUnique({ where });
      }
    }

    const stale = new Date(Date.now() - STALE_RESERVATION_MS);
    if (existing.answer === null && existing.createdAt < stale) {
      // Only one caller wins the takeover: the row must still be stale.
      const { count } = await this.ormService.chatReply.updateMany({
        where: { id: existing.id, answer: null, createdAt: { lt: stale } },
        data: { createdAt: new Date() },
      });
      if (count === 1) return { reservationId: existing.id };
    }
    return { existing };
  }

  async saveReply(
    reservationId: number,
    reply: { answer: string; quickReplies: string[]; topic?: string },
  ): Promise<void> {
    await this.ormService.chatReply.update({
      where: { id: reservationId },
      data: {
        answer: reply.answer,
        quickReplies: reply.quickReplies,
        topic: reply.topic || null,
      },
    });
  }

  /** Frees a reservation whose answer failed, so a retry can ask again. */
  async releaseReply(reservationId: number): Promise<void> {
    await this.ormService.chatReply.deleteMany({
      where: { id: reservationId, answer: null },
    });
  }
}

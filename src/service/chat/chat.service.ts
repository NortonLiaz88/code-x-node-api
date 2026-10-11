import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DbStartSession } from 'src/data/usecases/chat/db-start-session';
import {
  Session,
  TUTOR_SESSIONS_CONNECTION,
} from 'src/infra/mongodb/chat/model';
import { RemoteSendMessage } from 'src/data/usecases/chat/http-send-mesage';
import { InjectModel } from '@nestjs/mongoose';
import {
  ChatReplyDto,
  MAX_QUICK_REPLIES,
} from 'src/main/dto/chat/chat-reply/chat-reply.dto';
import { ChatPostgresRepository } from 'src/infra/postgresql/chat.repository';
import {
  ChatConversationDto,
  ChatHistoryMessageDto,
} from 'src/main/dto/chat/history/chat-history.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Session.name, TUTOR_SESSIONS_CONNECTION)
    private sessionModel: Model<Session>,
    @Inject() private readonly dbStartSession: DbStartSession,
    @Inject() private readonly httpSendMessage: RemoteSendMessage,
    @Inject() private readonly chatRepository: ChatPostgresRepository,
  ) {}

  async startSession(profileId: number): Promise<ChatModel> {
    const session = new this.sessionModel({ id: uuidv4() });
    await session.save();

    const chat = await this.dbStartSession.startSession(profileId, session.id);
    return chat;
  }

  async sendMessage(
    profileId: number,
    referenceId: string,
    message: string,
  ): Promise<ChatReplyDto> {
    const chat = await this.getOwnChat(profileId, referenceId);
    const reply = await this.httpSendMessage.sendMessage(
      profileId,
      referenceId,
      message,
    );
    await this.chatRepository.recordMessage(chat, reply.topic);
    return reply;
  }

  async getConversations(profileId: number): Promise<ChatConversationDto[]> {
    const chats = await this.chatRepository.getConversations(profileId);
    return chats.map((chat) => ({
      referenceId: chat.referenceId,
      topic: chat.topic ?? '',
      createdAt: chat.createdAt,
      lastMessageAt: chat.lastMessageAt,
    }));
  }

  async getMessages(
    profileId: number,
    referenceId: string,
  ): Promise<ChatHistoryMessageDto[]> {
    await this.getOwnChat(profileId, referenceId);
    const session = await this.sessionModel
      .findOne({ id: referenceId })
      .lean()
      .exec();

    return (session?.messages ?? [])
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        quickReplies:
          m.role === 'assistant'
            ? (m.tooltip ?? []).slice(0, MAX_QUICK_REPLIES)
            : [],
      }));
  }

  // Someone else's conversation answers the same as a missing one.
  private async getOwnChat(
    profileId: number,
    referenceId: string,
  ): Promise<ChatModel> {
    const chat = await this.chatRepository.getChatByReference(
      profileId,
      referenceId,
    );
    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }
}

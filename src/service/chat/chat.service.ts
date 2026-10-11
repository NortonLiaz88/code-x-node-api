import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DbStartSession } from 'src/data/usecases/chat/db-start-session';
import {
  Session,
  TUTOR_SESSIONS_CONNECTION,
} from 'src/infra/mongodb/chat/model';
import { RemoteSendMessage } from 'src/data/usecases/chat/http-send-mesage';
import { InjectModel } from '@nestjs/mongoose';
import { ChatReplyDto } from 'src/main/dto/chat/chat-reply/chat-reply.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Session.name, TUTOR_SESSIONS_CONNECTION)
    private sessionModel: Model<Session>,
    @Inject() private readonly dbStartSession: DbStartSession,
    @Inject() private readonly httpSendMessage: RemoteSendMessage,
  ) {}

  async startSession(profileId: number): Promise<ChatModel> {
    const session = new this.sessionModel({ id: uuidv4() });
    await session.save();

    const chat = await this.dbStartSession.startSession(profileId, session.id);
    return chat;
  }

  async sendMessage(
    profileId: number,
    chatId: string,
    message: string,
  ): Promise<ChatReplyDto> {
    return this.httpSendMessage.sendMessage(profileId, chatId, message);
  }
}

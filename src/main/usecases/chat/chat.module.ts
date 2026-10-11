import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Session,
  SessionDocument,
  SessionSchema,
  TUTOR_SESSIONS_CONNECTION,
} from 'src/infra/mongodb/chat/model';
import { makeDbStartSession } from 'src/main/factory/chat/db-start-session';
import { StartSessionController } from 'src/presentation/controllers/chat/start-session/start-session.controller';
import { ChatService } from 'src/service/chat/chat.service';
import { AuthModule } from '../auth/auth.module';
import { makeHttpSendMessage } from 'src/main/factory/chat/htt-send-message';
import { SendMessageController } from 'src/presentation/controllers/chat/send-message/send-message.controller';

@Module({
  controllers: [StartSessionController, SendMessageController],
  imports: [
    MongooseModule.forFeature(
      [{ name: Session.name, schema: SessionSchema }],
      TUTOR_SESSIONS_CONNECTION,
    ),
    AuthModule,
  ],
  providers: [
    {
      provide: ChatService,
      useFactory: (sessionModel: Model<SessionDocument>) => {
        const dbStartSession = makeDbStartSession();
        const httpChat = makeHttpSendMessage();
        return new ChatService(sessionModel, dbStartSession, httpChat);
      },
      inject: [getModelToken(Session.name, TUTOR_SESSIONS_CONNECTION)],
    },
  ],
})
export class ChatModule {}

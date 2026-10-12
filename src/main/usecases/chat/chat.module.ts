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
import { ChatHistoryController } from 'src/presentation/controllers/chat/history/chat-history.controller';
import { ChatPostgresRepository } from 'src/infra/postgresql/chat.repository';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { SendMessageStreamController } from 'src/presentation/controllers/chat/send-message-stream/send-message-stream.controller';
import { SendMessageController } from 'src/presentation/controllers/chat/send-message/send-message.controller';
import { TutorMetricsController } from 'src/presentation/controllers/chat/tutor-metrics/tutor-metrics.controller';
import { TutorMetricsRepository } from 'src/infra/postgresql/tutor-metrics.repository';
import { TutorMetricsService } from 'src/service/chat/tutor-metrics.service';

@Module({
  controllers: [
    StartSessionController,
    SendMessageController,
    SendMessageStreamController,
    ChatHistoryController,
    TutorMetricsController,
  ],
  imports: [
    MongooseModule.forFeature(
      [{ name: Session.name, schema: SessionSchema }],
      TUTOR_SESSIONS_CONNECTION,
    ),
    AuthModule,
  ],
  providers: [
    {
      provide: TutorMetricsRepository,
      useFactory: () => new TutorMetricsRepository(new PrismaClientService()),
    },
    TutorMetricsService,
    {
      provide: ChatService,
      useFactory: (
        sessionModel: Model<SessionDocument>,
        tutorMetrics: TutorMetricsRepository,
      ) => {
        const dbStartSession = makeDbStartSession();
        const httpChat = makeHttpSendMessage();
        const chatRepository = new ChatPostgresRepository(
          new PrismaClientService(),
        );
        return new ChatService(
          sessionModel,
          dbStartSession,
          httpChat,
          chatRepository,
          tutorMetrics,
        );
      },
      inject: [
        getModelToken(Session.name, TUTOR_SESSIONS_CONNECTION),
        TutorMetricsRepository,
      ],
    },
  ],
})
export class ChatModule {}

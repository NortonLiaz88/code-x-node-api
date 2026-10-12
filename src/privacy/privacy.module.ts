import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from 'src/infra/orm/prisma/prisma.module';
import {
  Session,
  SessionSchema,
  TUTOR_SESSIONS_CONNECTION,
} from 'src/infra/mongodb/chat/model';
import { PrivacyController } from './privacy.controller';
import { PrivacyService } from './privacy.service';

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature(
      [{ name: Session.name, schema: SessionSchema }],
      TUTOR_SESSIONS_CONNECTION,
    ),
  ],
  controllers: [PrivacyController],
  providers: [PrivacyService],
})
export class PrivacyModule {}

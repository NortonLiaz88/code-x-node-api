import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './main/usecases/user/user.module';
import { AuthModule } from './main/usecases/auth/auth.module';
import { ChatModule } from './main/usecases/chat/chat.module';
import { CoursesModule } from './courses/courses.module';
import { ActivityModule } from './activity/activity.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileModule } from './profile/profile.module';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './files/files.module';
import { UserActivitiesModule } from './user-activities/user-activities.module';
import { ProgressModule } from './progress/progress.module';
import { PurchasesModule } from './purchases/purchases.module';
import {
  TUTOR_SESSIONS_CONNECTION,
  tutorSessionsDbName,
} from './infra/mongodb/chat/model';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Lesson templates.
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: 'db',
    }),
    // Tutor chat sessions, shared with code-x-ai.
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionName: TUTOR_SESSIONS_CONNECTION,
      dbName: tutorSessionsDbName(),
    }),
    UserModule,
    AuthModule,
    ChatModule,
    CoursesModule,
    ActivityModule,
    ProfileModule,
    FileModule,
    UserActivitiesModule,
    ProgressModule,
    PurchasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

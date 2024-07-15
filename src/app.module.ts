import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './main/usecases/user/user.module';
import { AuthModule } from './main/usecases/auth/auth.module';
import { ChatModule } from './main/usecases/chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from './main/usecases/schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://admin:adminadmin@82.197.92.146:27017', {
      dbName: 'codex'
    }),
    UserModule,
    AuthModule,
    ChatModule,
    ScheduleModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}

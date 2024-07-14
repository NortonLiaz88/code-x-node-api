import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './main/usecases/user/user.module';
import { AuthModule } from './main/usecases/auth/auth.module';
import { ChatModule } from './main/usecases/chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}

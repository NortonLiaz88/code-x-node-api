import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './main/usecases/user/user.module';
import { AuthModule } from './main/usecases/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

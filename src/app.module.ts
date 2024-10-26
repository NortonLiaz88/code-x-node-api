import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './main/usecases/user/user.module';
import { AuthModule } from './main/usecases/auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { ActivityModule } from './activity/activity.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: 'db',
    }),
    UserModule, 
    AuthModule, 
    CoursesModule, 
    ActivityModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

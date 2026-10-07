import { Module } from '@nestjs/common';
import { UserActivitiesService } from './user-activities.service';
import { UserActivitiesController } from './user-activities.controller';
import { CoursesModule } from 'src/courses/courses.module';
import { UserActivitiesRepository } from './repository/user-activities.repository';
import { PrismaModule } from 'src/infra/orm/prisma/prisma.module';
import { ActivityModule } from 'src/activity/activity.module';
import { ProgressModule } from 'src/progress/progress.module';

@Module({
  controllers: [UserActivitiesController],
  providers: [UserActivitiesService, UserActivitiesRepository],
  imports: [ActivityModule, PrismaModule, CoursesModule, ProgressModule],
})
export class UserActivitiesModule {}

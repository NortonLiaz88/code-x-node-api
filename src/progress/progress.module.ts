import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { ActivityModule } from 'src/activity/activity.module';
import { CoursesModule } from 'src/courses/courses.module';
import { PrismaModule } from 'src/infra/orm/prisma/prisma.module';
import { ProgressRepository } from './repository/progress.repository';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService, ProgressRepository],
  exports: [ProgressService],
  imports: [ActivityModule,  PrismaModule, CoursesModule],
})
export class ProgressModule {}

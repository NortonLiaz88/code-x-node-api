import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronActivityService } from './cron-activity.service';
import {
  CodeOrganization,
  CodeOrganizationSchema,
  MultipleChoiceExercise,
  MultipleChoiceExerciseSchema,
  CodeCompletionExercise,
  CodeCompletionExerciseSchema,
} from './entities/activity.entitie';
import { PrismaModule } from 'src/infra/orm/prisma/prisma.module';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CodeOrganization.name, schema: CodeOrganizationSchema },
      {
        name: MultipleChoiceExercise.name,
        schema: MultipleChoiceExerciseSchema,
      },
      {
        name: CodeCompletionExercise.name,
        schema: CodeCompletionExerciseSchema,
      },
    ]),
    PrismaModule,
  ],
  controllers: [
    ActivityController,
  ],
  providers: [CronActivityService, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}

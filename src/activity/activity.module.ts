import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './activity.service';
import {
  CodeOrganization,
  CodeOrganizationSchema,
  MultipleChoiceExercise,
  MultipleChoiceExerciseSchema,
  CodeCompletionExercise,
  CodeCompletionExerciseSchema,
} from './entities/activity.entitie';
import { PrismaModule } from 'src/infra/orm/prisma/prisma.module';

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
  providers: [ActivityService],
})
export class ActivityModule {}

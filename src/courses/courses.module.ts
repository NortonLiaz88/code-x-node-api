import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoursesRepository } from './repository/course.repository';
import { PrismaModule } from 'src/infra/orm/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepository],
})
export class CoursesModule {}

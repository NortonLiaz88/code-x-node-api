import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from 'src/courses/repository/course.repository';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';

@Injectable()
export class UserActivitiesRepository {
  constructor(
    private readonly prismaService: PrismaClientService,
    private readonly coursesRepository: CoursesRepository,
  ) {}

  public async saveUserActivity(
    correct: boolean,
    userId: number,
    activityId: number,
  ) {
    const activeCourse =
      await this.coursesRepository.findActiveUserCourses(userId);

    if (!activeCourse) {
      throw new NotFoundException('No active course found for this user');
    }

    const userActivity = await this.prismaService.userActivity.create({
      data: {
        userCourse: {
          connect: {
            id: activeCourse.id,
          },
        },
        activity: {
          connect: {
            id: activityId,
          },
        },
        finished: true,
        correct,
      },
    });

    return userActivity;
  }

  public async updateUserActivity(
    id: number,
    userId: number,
    correct: boolean,
  ) {
    const activeCourse =
      await this.coursesRepository.findActiveUserCourses(userId);

    if (!activeCourse) {
      throw new NotFoundException('No active course found for this user');
    }

    const userActivity = await this.prismaService.userActivity.update({
      where: {
        id,
      },
      data: {
        correct,
      },
    });

    return userActivity;
  }
}

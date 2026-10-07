import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CoursesRepository } from './repository/course.repository';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CoursesRepository) {}

  public async findActiveUserCourses(userId: number) {
    const course = await this.courseRepository.findActiveUserCourses(userId);
    const userActivities =
      await this.courseRepository.findUserActivities(userId);

    let enabledActivities = [];
    if (userActivities && course?.activties) {
      enabledActivities = course.activties.map((activity) => {
        const isUserActivity = userActivities.find(
          (userActivity) => userActivity.activityId === activity.id,
        );
        console.log(activity, isUserActivity);
        return {
          ...activity,
          enabled: !!isUserActivity, // Se não estiver nas atividades do usuário, habilita como false
          finished: !!isUserActivity?.finished,
        };
      });

      if (userActivities.length > 0) {
        const lastUserActivity = userActivities[userActivities.length - 1];
        const lastActivityIndex = enabledActivities.findIndex(
          (activity) => activity.id === lastUserActivity.activityId,
        );
        enabledActivities[lastActivityIndex].enabled = true;

        if (lastUserActivity.finished) {
          if (lastActivityIndex < enabledActivities.length - 1) {
            enabledActivities[lastActivityIndex + 1].enabled = true;
          }
        }
      }
    } else if (course?.activties) {
      enabledActivities = course.activties.map((activity) => ({
        ...activity,
        enabled: false,
      }));
    }

    // Habilitar a primeira atividade, se houver alguma atividade no array
    if (enabledActivities.length > 0) {
      enabledActivities[0].enabled = true;
    }

    delete course.activties;

    return { ...course, activities: enabledActivities };
  }

  create(createCourseDto: CreateCourseDto) {
    return 'This action adds a new course';
  }

  findAll() {
    return `This action returns all courses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}

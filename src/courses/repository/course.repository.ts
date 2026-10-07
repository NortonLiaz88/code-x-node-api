import { Injectable } from '@nestjs/common';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { CourseEntity } from '../entities/course.entity';

@Injectable()
export class CoursesRepository {
  constructor(private readonly prismaService: PrismaClientService) {}

  public async findActiveUserCourses(userId: number): Promise<CourseEntity> {
    // Busca o curso ativo do usuário e o nível do curso
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        userCourse: {
          where: {
            active: true,
          },
          select: {
            course: {
              select: {
                id: true,
                level: true, // Obtém o nível do curso
              },
            },
            userActivities: true,
          },
        },
      },
    });

    // Verifica se há um curso ativo e obtém o nível
    const activeCourse = user?.userCourse?.[0]?.course;

    if (!activeCourse) {
      return null; // Caso o usuário não tenha curso ativo
    }

    const { id: courseId, level } = activeCourse;

    // Retorna o curso com as atividades filtradas pelo nível do curso
    return await this.prismaService.course.findUnique({
      where: {
        id: courseId,
        level: level,
      },
      include: {
        activties: true,
      },
    });
  }

  public async findUserActivities(userId: number) {
    const userActivities = await this.prismaService.userActivity.findMany({
      where: {
        userCourse: {
          userId: userId,
        },
      }
    });
    return userActivities;
  }

}

import { Injectable } from '@nestjs/common';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';

@Injectable()
export class CoursesRepository {
  constructor(private readonly prismaService: PrismaClientService) {}

  public async findActiveUserCourses(userId: number) {
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
          },
        },
      },
    });

    // Verifica se há um curso ativo e obtém o nível
    const activeCourse = user?.userCourse?.[0]?.course;

    if (!activeCourse) {
      return []; // Caso o usuário não tenha curso ativo
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
      }
    });
  }
}

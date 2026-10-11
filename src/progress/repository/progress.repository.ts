import { Injectable } from '@nestjs/common';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { isSameDay } from 'date-fns';
import { NewProgress } from '../dto/progress.dto';

@Injectable()
export class ProgressRepository {
  constructor(private readonly prismaService: PrismaClientService) {}

  // Método para buscar o progresso do usuário
  public async findUserProgress(userId: number) {
    const profile = await this.prismaService.profile.findUnique({
      where: {
        userId: userId,
      },
    });

    const userProgress = await this.prismaService.progress.findMany({
      where: {
        profileId: profile.id,
      },
    });

    return userProgress;
    // Implementação do método
  }

  // Método para atualizar o progresso do usuário por atividade
  public async updateUserProgress(userId: number): Promise<NewProgress> {
    const profile = await this.prismaService.profile.findUnique({
      where: {
        userId: userId,
      },
      include: {
        Progress: true,
      },
    });

    // Users who signed up through the app have no progress row yet.
    if (!profile.Progress) {
      profile.Progress = await this.prismaService.progress.create({
        data: {
          profileId: profile.id,
          consecutiveDays: 0,
          exercises: 0,
          chat: 0,
          accumulatedDiamonds: 0,
          accumulatedExpirience: 0,
          done: 0,
          accumulatedTime: 0,
        },
      });
    }

    const isConsecutive = await this.verifyConsecutiveDays(userId);

    await this.prismaService.progress.update({
      where: {
        profileId: profile.id,
      },
      data: {
        accumulatedDiamonds: profile.Progress.accumulatedDiamonds + 10,
        accumulatedExpirience: profile.Progress.accumulatedExpirience + 20,
        accumulatedTime: profile.Progress.accumulatedExpirience + 120,
        consecutiveDays: isConsecutive
          ? profile.Progress.consecutiveDays + 1
          : 1,
      },
    });

    return {
      accumulatedDiamonds: 10,
      accumulatedExpirience: 20,
      accumulatedTime: 120,
      consecutiveDays: isConsecutive ? profile.Progress.consecutiveDays + 1 : 1,
    };
    // Implementação do método
  }

  public async verifyConsecutiveDays(userId: number) {
    // Implementação do método
    const lastChat = await this.prismaService.chat.findFirst({
      where: {
        profile: {
          userId: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const currentDate = new Date();

    if (lastChat && isSameDay(new Date(lastChat.createdAt), currentDate)) {
      return true;
    }

    const lastActivity = await this.prismaService.userActivity.findFirst({
      where: {
        userCourse: {
          userId: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (
      lastActivity &&
      isSameDay(new Date(lastActivity.createdAt), currentDate)
    ) {
      return true;
    }

    return false;
  }

  public async getActivityMonthCalendar(userId: number, month: number) {
    const chatDays = await this.prismaService.chat.findMany({
      where: {
        profile: {
          userId: userId,
        },
        createdAt: {
          gte: new Date(new Date().getFullYear(), month - 1, 1),
          lt: new Date(new Date().getFullYear(), month, 1),
        },
      },
      select: {
        createdAt: true,
      },
    });

    const activityDays = await this.prismaService.userActivity.findMany({
      where: {
        userCourse: {
          userId: userId,
        },
        createdAt: {
          gte: new Date(new Date().getFullYear(), month - 1, 1),
          lt: new Date(new Date().getFullYear(), month, 1),
        },
      },
      select: {
        createdAt: true,
      },
    });

    const daysSet = new Set<string>();

    chatDays.concat(activityDays).forEach((record) => {
      const day = record.createdAt.toISOString().split('T')[0]; // Extract YYYY-MM-DD
      daysSet.add(day);
    });

    return Array.from(daysSet).sort(); // Sorted array of active days
  }

  public async getTimeSlot(userId: number) {
    const timeSlot = await this.prismaService.schedule.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
      select: {
        timeSlot: true,
      },
    });

    return timeSlot;
  }
}

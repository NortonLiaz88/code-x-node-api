import { Injectable } from '@nestjs/common';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { UpdateScheduleFormDTO } from './dto/update-schedule.dto';
import { UpdateAccountDTO } from './dto/update-account.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaClientService,) {}

  public async getProfile(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      include: {
        profile: true,
        userPreference: true,
      },
    });

    console.log('USER PROFILE', user.profile);
    const progress = await this.prismaService.progress.findUnique({
      where: {
        profileId: user.profile.id,
      },
    });
    console.log('PROGRESS', progress);

    return { ...user, progress };
  }

  public async getUserSchedule(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });

    const schedule = await this.prismaService.schedule.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
      orderBy: {
        id: 'desc',
      }
    });

    return schedule;
  }

  public async updateUserSchedule(scheduleId: number, data: UpdateScheduleFormDTO) {
    const schedule = await this.prismaService.schedule.update({
      where: {
        id: +scheduleId,
      },
      data: {
        name: data.name,
        icon: data.icon,
        color: data.color,
        goalCount: +data.goalCount,
        goalFrequency: +data.goalFrequency,
        days: {
          set: data.days,
        },
        timeSlot: data.timeSlot,
        remind: data.remind,
      },
    });

    return schedule;
  }


  public async updateUserAccount(userId: number, data: UpdateAccountDTO) {
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        userPreference: {
          update: {
            soundEffects: data.soundEffects,
            vibration: data.hapticFeedback,
            notification: data.notifications,
            chatAnimation: data.animations,
          },
        }
      },
    });
  }
}

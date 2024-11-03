import { Injectable } from '@nestjs/common';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaClientService) {}

  async getProfile(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      include: {
        profile: true,
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

    const schedule = await this.prismaService.schedule.findMany({
      where: {
        user: {
          id: userId,
        },
      },
    });

    return schedule;
  }
}

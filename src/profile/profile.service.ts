import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { UpdateScheduleFormDTO } from './dto/update-schedule.dto';
import { UpdateAccountDTO } from './dto/update-account.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Prisma } from '@prisma/client';
import { FieldErrorDto, fieldConflict } from 'src/main/dto/error/field-errors';
import * as bcrypt from 'bcrypt';
const UNIQUE_FIELDS = ['username', 'email', 'phoneNumber'] as const;

const TAKEN_MESSAGES: Record<(typeof UNIQUE_FIELDS)[number], string> = {
  username: 'Este nome de usuário já está em uso.',
  email: 'Este email já está em uso.',
  phoneNumber: 'Este celular já está em uso.',
};

const ACCOUNT_FIELDS = {
  id: true,
  username: true,
  email: true,
  phoneNumber: true,
  updatedAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaClientService) {}

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

    const progress = await this.prismaService.progress.findUnique({
      where: {
        profileId: user.profile.id,
      },
    });
    // Never send the password hash.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...account } = user;
    return { ...account, progress };
  }

  // Changes username, email and phone; a value someone else has gets a
  // 409 naming each taken field.
  public async updateProfile(userId: number, data: UpdateProfileDto) {
    const changes = Object.fromEntries(
      UNIQUE_FIELDS.filter((field) => data[field] !== undefined).map(
        (field) => [field, data[field].trim()],
      ),
    ) as UpdateProfileDto;

    const taken: FieldErrorDto[] = [];
    for (const field of UNIQUE_FIELDS) {
      if (changes[field] === undefined) continue;
      const other = await this.prismaService.user.findFirst({
        where: { [field]: changes[field], NOT: { id: userId } },
        select: { id: true },
      });
      if (other) taken.push({ field, message: TAKEN_MESSAGES[field] });
    }
    if (taken.length) throw fieldConflict(taken);

    try {
      const user = await this.prismaService.user.update({
        where: { id: userId },
        data: changes,
        select: ACCOUNT_FIELDS,
      });
      return user;
    } catch (err) {
      // Someone took the value between the check and the update.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const target = [err.meta?.target ?? []].flat().map(String);
        throw fieldConflict(
          UNIQUE_FIELDS.filter((field) => target.includes(field)).map(
            (field) => ({ field, message: TAKEN_MESSAGES[field] }),
          ),
        );
      }
      throw err;
    }
  }

  public async getUserSchedule(userId: number) {
    const schedule = await this.prismaService.schedule.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return schedule;
  }

  public async updateUserSchedule(
    userId: number,
    scheduleId: number,
    data: UpdateScheduleFormDTO,
  ) {
    const owned = await this.prismaService.schedule.findFirst({
      where: { id: +scheduleId, userId },
    });
    if (!owned) {
      throw new NotFoundException('Schedule not found');
    }

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
    await this.prismaService.user.update({
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
        },
      },
    });
  }
}

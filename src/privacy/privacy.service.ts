import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import {
  Session,
  TUTOR_SESSIONS_CONNECTION,
} from 'src/infra/mongodb/chat/model';

@Injectable()
export class PrivacyService {
  constructor(
    private readonly prisma: PrismaClientService,
    @InjectModel(Session.name, TUTOR_SESSIONS_CONNECTION)
    private readonly sessions: Model<Session>,
  ) {}

  /** Everything stored about the user, for GET /me/export. */
  async exportData(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        lastName: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        diamonds: true,
        experience: true,
        role: true,
        privacyPolicyVersion: true,
        privacyConsentAt: true,
        profile: {
          include: {
            Progress: true,
            chat: {
              select: {
                referenceId: true,
                name: true,
                topic: true,
                createdAt: true,
                lastMessageAt: true,
              },
            },
          },
        },
        userPreference: true,
        schedule: { include: { DailyProgress: true } },
        userCourse: {
          include: {
            course: { select: { name: true, language: true, level: true } },
            userActivities: true,
            dailyProgress: true,
          },
        },
        purchases: { include: { item: true } },
      },
    });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const chats = user.profile?.chat ?? [];
    const sessions = await this.sessions
      .find({ id: { $in: referenceIds(chats) } })
      .lean()
      .exec();
    const messagesBySession = new Map(
      sessions.map((session) => [
        session.id,
        // The tutor's own instructions are not the student's data.
        session.messages
          .filter((message) => message.role !== 'system')
          .map(({ role, content }) => ({ role, content })),
      ]),
    );

    const { profile, ...account } = user;
    return {
      exportedAt: new Date().toISOString(),
      account,
      profile: profile && { ...profile, chat: undefined },
      chats: chats.map((chat) => ({
        ...chat,
        messages: messagesBySession.get(chat.referenceId) ?? [],
      })),
    };
  }

  /**
   * Deletes the account and everything linked to it, tutor sessions
   * included. Mongo goes first: if Postgres then fails, the account still
   * exists and the student can try again.
   */
  async deleteAccount(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profile: {
          select: { id: true, chat: { select: { referenceId: true } } },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const chats = user.profile?.chat ?? [];
    if (chats.length) {
      await this.sessions
        .deleteMany({ id: { $in: referenceIds(chats) } })
        .exec();
    }

    const profileId = user.profile?.id ?? -1;
    const ownCourse = { userCourse: { userId } };
    await this.prisma.$transaction([
      this.prisma.userActivity.deleteMany({ where: ownCourse }),
      this.prisma.dailyProgress.deleteMany({
        where: { OR: [ownCourse, { schedule: { userId } }] },
      }),
      this.prisma.userCourse.deleteMany({ where: { userId } }),
      this.prisma.schedule.deleteMany({ where: { userId } }),
      this.prisma.purchase.deleteMany({ where: { userId } }),
      this.prisma.userPreference.deleteMany({ where: { userId } }),
      this.prisma.progress.deleteMany({ where: { profileId } }),
      // Replies and tutor metrics go with their chat (ON DELETE CASCADE).
      this.prisma.chat.deleteMany({ where: { profileId } }),
      this.prisma.profile.deleteMany({ where: { userId } }),
      // Password resets go with the user (ON DELETE CASCADE).
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }
}

const referenceIds = (chats: { referenceId: string | null }[]) =>
  chats.map((chat) => chat.referenceId).filter((id): id is string => !!id);

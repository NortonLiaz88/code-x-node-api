import { Injectable } from '@nestjs/common';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';

export type ResetRow = {
  id: number;
  userId: number;
  expiresAt: Date;
  usedAt: Date | null;
};

export interface PasswordResetStore {
  findUserByEmail(email: string): Promise<{ id: number; email: string } | null>;
  userExists(userId: number): Promise<boolean>;
  // Saves a new token and drops the user's earlier unused ones.
  replaceToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  findToken(tokenHash: string): Promise<ResetRow | null>;
  // Marks the token used and sets the password together. False when the
  // token was used in the meantime.
  consumeAndSetPassword(
    resetId: number,
    passwordHash: string,
    now: Date,
  ): Promise<boolean>;
  setPassword(userId: number, passwordHash: string): Promise<void>;
}

export const PASSWORD_RESET_STORE = Symbol('PASSWORD_RESET_STORE');

@Injectable()
export class PrismaPasswordResetStore implements PasswordResetStore {
  constructor(private readonly prisma: PrismaClientService) {}

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
  }

  async userExists(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return user !== null;
  }

  async replaceToken(userId: number, tokenHash: string, expiresAt: Date) {
    await this.prisma.$transaction([
      this.prisma.passwordReset.deleteMany({ where: { userId, usedAt: null } }),
      this.prisma.passwordReset.create({
        data: { userId, tokenHash, expiresAt },
      }),
    ]);
  }

  findToken(tokenHash: string) {
    return this.prisma.passwordReset.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
  }

  consumeAndSetPassword(resetId: number, passwordHash: string, now: Date) {
    return this.prisma.$transaction(async (tx) => {
      const used = await tx.passwordReset.updateMany({
        where: { id: resetId, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (used.count !== 1) return false;
      const reset = await tx.passwordReset.findUnique({
        where: { id: resetId },
        select: { userId: true },
      });
      await tx.user.update({
        where: { id: reset.userId },
        data: { password: passwordHash },
      });
      return true;
    });
  }

  async setPassword(userId: number, passwordHash: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  }
}

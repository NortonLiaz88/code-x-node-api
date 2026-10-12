import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Mail, Mailer } from './mailer';
import {
  hashToken,
  INVALID_RESET_LINK,
  PasswordResetService,
} from './password-reset.service';
import { PasswordResetStore, ResetRow } from './password-reset.store';

class MemoryStore implements PasswordResetStore {
  users = new Map([[1, { id: 1, email: 'ana@example.com', password: 'old' }]]);
  resets: (ResetRow & { tokenHash: string })[] = [];

  async findUserByEmail(email: string) {
    const user = [...this.users.values()].find((u) => u.email === email);
    return user ? { id: user.id, email: user.email } : null;
  }
  async userExists(userId: number) {
    return this.users.has(userId);
  }
  async replaceToken(userId: number, tokenHash: string, expiresAt: Date) {
    this.resets = this.resets.filter((r) => r.userId !== userId || r.usedAt);
    this.resets.push({
      id: this.resets.length + 1,
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
    });
  }
  async findToken(tokenHash: string) {
    return this.resets.find((r) => r.tokenHash === tokenHash) ?? null;
  }
  async consumeAndSetPassword(id: number, passwordHash: string, now: Date) {
    const reset = this.resets.find((r) => r.id === id);
    if (!reset || reset.usedAt || reset.expiresAt <= now) return false;
    reset.usedAt = now;
    this.users.get(reset.userId).password = passwordHash;
    return true;
  }
  async setPassword(userId: number, passwordHash: string) {
    this.users.get(userId).password = passwordHash;
  }
}

class MemoryMailer implements Mailer {
  sent: Mail[] = [];
  async send(mail: Mail) {
    this.sent.push(mail);
  }
}

const setup = () => {
  const store = new MemoryStore();
  const mailer = new MemoryMailer();
  let now = new Date('2026-10-12T12:00:00Z');
  const service = new PasswordResetService(store, mailer, () => now, {
    ttlMinutes: 30,
    linkBase: 'codex://reset-password',
  });
  const advance = (minutes: number) => {
    now = new Date(now.getTime() + minutes * 60_000);
  };
  const tokenFromMail = () =>
    /token=([\w-]+)/.exec(mailer.sent[mailer.sent.length - 1].text)[1];
  return { store, mailer, service, advance, tokenFromMail };
};

const invalid = new BadRequestException(INVALID_RESET_LINK);

describe('PasswordResetService', () => {
  it('emails a link and sets the new password once', async () => {
    const { store, mailer, service, tokenFromMail } = setup();

    await service.requestReset(' ana@example.com ');
    const token = tokenFromMail();
    await service.resetPassword(token, 'nova-senha1');

    expect(mailer.sent[0].to).toBe('ana@example.com');
    expect(mailer.sent[0].text).toContain('30 minutos');
    expect(store.resets[0].tokenHash).toBe(hashToken(token));
    expect(store.resets[0].tokenHash).not.toBe(token);
    expect(
      await bcrypt.compare('nova-senha1', store.users.get(1).password),
    ).toBe(true);
  });

  it('rejects a link used twice', async () => {
    const { service, tokenFromMail } = setup();
    await service.requestReset('ana@example.com');
    const token = tokenFromMail();
    await service.resetPassword(token, 'nova-senha1');

    await expect(service.resetPassword(token, 'outra-senha2')).rejects.toEqual(
      invalid,
    );
  });

  it('rejects an expired link', async () => {
    const { store, service, advance, tokenFromMail } = setup();
    await service.requestReset('ana@example.com');
    advance(30);

    await expect(
      service.resetPassword(tokenFromMail(), 'nova-senha1'),
    ).rejects.toEqual(invalid);
    expect(store.users.get(1).password).toBe('old');
  });

  it('rejects an unknown token', async () => {
    const { service } = setup();

    await expect(
      service.resetPassword('inventado', 'nova-senha1'),
    ).rejects.toEqual(invalid);
  });

  it('keeps only the newest link working', async () => {
    const { service, tokenFromMail } = setup();
    await service.requestReset('ana@example.com');
    const first = tokenFromMail();
    await service.requestReset('ana@example.com');

    await expect(service.resetPassword(first, 'nova-senha1')).rejects.toEqual(
      invalid,
    );
    await service.resetPassword(tokenFromMail(), 'nova-senha1');
  });

  it('sends nothing for an unknown email, without saying so', async () => {
    const { store, mailer, service } = setup();

    await expect(
      service.requestReset('ninguem@example.com'),
    ).resolves.toBeUndefined();
    expect(mailer.sent).toEqual([]);
    expect(store.resets).toEqual([]);
  });

  it('answers normally when the email fails to send', async () => {
    const { mailer, service } = setup();
    mailer.send = () => Promise.reject(new Error('smtp down'));

    await expect(
      service.requestReset('ana@example.com'),
    ).resolves.toBeUndefined();
  });

  it('lets an admin set a password, and says when the user is missing', async () => {
    const { store, service } = setup();

    await service.adminSetPassword(1, 'pelo-admin3');
    await expect(service.adminSetPassword(9, 'x12345')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      await bcrypt.compare('pelo-admin3', store.users.get(1).password),
    ).toBe(true);
  });
});

describe('reset password body', () => {
  it('asks for the same password rule as login', async () => {
    const { plainToInstance } = await import('class-transformer');
    const { validate } = await import('class-validator');
    const { ResetPasswordDto } = await import('./dto/password-reset.dto');
    const check = async (password: string) =>
      (
        await validate(
          plainToInstance(ResetPasswordDto, { token: 't', password }),
        )
      ).length;

    expect(await check('semnumero')).toBe(1);
    expect(await check('a1')).toBe(1);
    expect(await check('senha1')).toBe(0);
  });
});

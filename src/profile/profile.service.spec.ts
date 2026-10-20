import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProfileService } from './profile.service';
import * as bcrypt from 'bcrypt';

const makeService = (others: Record<string, string>[] = []) => {
  const user = {
    findFirst: jest.fn(async ({ where }) => {
      const [field] = Object.keys(where).filter((k) => k !== 'NOT');
      return others.some((o) => o[field] === where[field]) ? { id: 2 } : null;
    }),
    update: jest.fn(async ({ data }) => ({ id: 1, ...data })),
  };
  const service = new ProfileService({ user } as any);
  return { service, user };
};

const conflictBody = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (err) {
    expect(err).toBeInstanceOf(ConflictException);
    return (err as ConflictException).getResponse();
  }
  throw new Error('expected a conflict');
};

describe('ProfileService.updateProfile', () => {
  it('saves only the fields sent, trimmed', async () => {
    const { service, user } = makeService();

    const result = await service.updateProfile(1, {
      email: ' nova@example.com ',
    });

    expect(user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { email: 'nova@example.com' },
      }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it('names every field someone else already uses', async () => {
    const { service, user } = makeService([
      { email: 'bia@example.com' },
      { username: 'bia' },
    ]);

    const body = await conflictBody(
      service.updateProfile(1, {
        username: 'bia',
        email: 'bia@example.com',
        phoneNumber: '+5592991234567',
      }),
    );

    expect(body).toMatchObject({
      statusCode: 409,
      fields: [
        { field: 'username', message: 'Este nome de usuário já está em uso.' },
        { field: 'email', message: 'Este email já está em uso.' },
      ],
    });
    expect(user.update).not.toHaveBeenCalled();
  });

  it('names the field when the database catches the duplicate', async () => {
    const { service, user } = makeService();
    user.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.21.1',
        meta: { target: ['email'] },
      }),
    );

    const body = await conflictBody(
      service.updateProfile(1, { email: 'bia@example.com' }),
    );

    expect(body).toMatchObject({ fields: [{ field: 'email' }] });
  });
});

describe('ProfileService preferences and password', () => {
  it('saves the accessibility switches without touching the password', async () => {
    const { service, user } = makeService();

    await service.updateProfile(1, { vibration: false, chatAnimation: true });

    const { data } = user.update.mock.calls[0][0];
    expect(data).toEqual({
      userPreference: {
        upsert: {
          create: { vibration: false, chatAnimation: true },
          update: { vibration: false, chatAnimation: true },
        },
      },
    });
    expect(data).not.toHaveProperty('password');
  });

  const withPassword = async (plain: string) => {
    const hash = await bcrypt.hash(plain, 4);
    const user = {
      findUnique: jest.fn(async () => ({ password: hash })),
      update: jest.fn(async (_args: any) => ({})),
    };
    return { service: new ProfileService({ user } as any), user };
  };

  it('changes the password when the current one matches', async () => {
    const { service, user } = await withPassword('antiga1');

    await service.changePassword(1, {
      currentPassword: 'antiga1',
      newPassword: 'nova123',
    });

    const { data } = user.update.mock.calls[0][0];
    expect(await bcrypt.compare('nova123', data.password)).toBe(true);
  });

  it('names the current password field when it is wrong', async () => {
    const { service, user } = await withPassword('antiga1');

    await expect(
      service.changePassword(1, {
        currentPassword: 'errada1',
        newPassword: 'nova123',
      }),
    ).rejects.toMatchObject({
      response: { fields: [{ field: 'currentPassword' }] },
    });
    expect(user.update).not.toHaveBeenCalled();
  });
});

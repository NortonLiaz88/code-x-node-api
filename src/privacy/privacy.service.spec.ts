import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrivacyService } from './privacy.service';

const lower = (model: string) => model[0].toLowerCase() + model.slice(1);

// A Prisma stand-in that records which model each delete targets.
const makeService = (user: unknown) => {
  const calls: string[] = [];
  const order: string[] = [];
  const model = (name: string) => ({
    findUnique: jest.fn(async () => user),
    deleteMany: jest.fn(() => `${name}.deleteMany`),
    delete: jest.fn(() => `${name}.delete`),
  });
  const prisma = new Proxy({} as Record<string, unknown>, {
    get(target, key: string) {
      if (key === '$transaction') {
        return jest.fn(async (ops: string[]) => {
          order.push('postgres');
          calls.push(...ops);
        });
      }
      return (target[key] ??= model(key));
    },
  });
  const sessions = {
    find: jest.fn(() => ({
      lean: () => ({
        exec: async () => [
          {
            id: 'session-1',
            messages: [
              { role: 'system', content: 'Você é um tutor...' },
              { role: 'user', content: 'O que é uma variável?' },
              { role: 'assistant', content: 'Uma variável guarda um valor.' },
            ],
          },
        ],
      }),
    })),
    deleteMany: jest.fn(() => ({
      exec: async () => {
        order.push('mongo');
      },
    })),
  };
  const service = new PrivacyService(prisma as any, sessions as any);
  return { service, calls, order, sessions, prisma };
};

const storedUser = {
  id: 7,
  email: 'ana@example.com',
  username: 'ana',
  profile: {
    id: 3,
    chat: [
      { referenceId: 'session-1', name: 'Variáveis' },
      { referenceId: null, name: 'Sem sessão' },
    ],
  },
};

// Every model that holds a foreign key to a user-owned model, found from the
// Prisma schema, so a new table linked to users can't be forgotten.
const userOwnedModels = () => {
  const models = Prisma.dmmf.datamodel.models;
  const owned = new Map<string, boolean>(); // model -> deleted by cascade
  const visit = (parent: string) => {
    for (const model of models) {
      for (const field of model.fields) {
        if (
          field.type === parent &&
          field.relationFromFields?.length &&
          !owned.has(model.name)
        ) {
          owned.set(model.name, field.relationOnDelete === 'Cascade');
          visit(model.name);
        }
      }
    }
  };
  visit('User');
  return owned;
};

describe('PrivacyService.deleteAccount', () => {
  it('deletes every table linked to the user, or leaves it to a cascade', async () => {
    const { service, calls } = makeService(storedUser);

    await service.deleteAccount(7);

    const deleted = new Set(calls.map((call) => call.split('.')[0]));
    for (const [model, cascades] of userOwnedModels()) {
      expect({ model, handled: cascades || deleted.has(lower(model)) }).toEqual(
        { model, handled: true },
      );
    }
    expect(calls[calls.length - 1]).toBe('user.delete');
  });

  it('deletes the tutor sessions first', async () => {
    const { service, sessions, order } = makeService(storedUser);

    await service.deleteAccount(7);

    expect(sessions.deleteMany).toHaveBeenCalledWith({
      id: { $in: ['session-1'] },
    });
    expect(order).toEqual(['mongo', 'postgres']);
  });

  it('skips Mongo for a student who never chatted', async () => {
    const { service, sessions } = makeService({ id: 7, profile: null });

    await service.deleteAccount(7);

    expect(sessions.deleteMany).not.toHaveBeenCalled();
  });

  it('answers 404 for an account that is already gone', async () => {
    const { service } = makeService(null);

    await expect(service.deleteAccount(7)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('PrivacyService.exportData', () => {
  it("includes the student's conversations without the tutor's instructions", async () => {
    const { service } = makeService(storedUser);

    const data = await service.exportData(7);

    expect(data.chats[0].messages).toEqual([
      { role: 'user', content: 'O que é uma variável?' },
      { role: 'assistant', content: 'Uma variável guarda um valor.' },
    ]);
    expect(data.chats[1].messages).toEqual([]);
    expect(data.account).toMatchObject({ email: 'ana@example.com' });
  });

  it('never selects the password', async () => {
    const { service, prisma } = makeService(storedUser);

    await service.exportData(7);

    const { select } = (prisma.user as any).findUnique.mock.calls[0][0];
    expect(select).not.toHaveProperty('password');
    expect(select).not.toHaveProperty('passwordResets');
  });
});

import { ProgressRepository } from './progress.repository';

const makeSut = (progress: object | null) => {
  const prisma = {
    profile: {
      findUnique: jest.fn().mockResolvedValue({ id: 4, Progress: progress }),
    },
    progress: {
      create: jest.fn().mockImplementation(({ data }) => data),
      update: jest.fn().mockResolvedValue({}),
    },
    chat: { findFirst: jest.fn().mockResolvedValue(null) },
    userActivity: { findFirst: jest.fn().mockResolvedValue(null) },
  };
  const sut = new ProgressRepository(prisma as any);
  return { sut, prisma };
};

describe('ProgressRepository.updateUserProgress', () => {
  it('works for a user with no chats, activities or progress yet', async () => {
    const { sut, prisma } = makeSut(null);

    const result = await sut.updateUserProgress(1);

    expect(prisma.progress.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ profileId: 4, accumulatedDiamonds: 0 }),
    });
    expect(prisma.progress.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { profileId: 4 },
        data: expect.objectContaining({
          accumulatedDiamonds: 10,
          consecutiveDays: 1,
        }),
      }),
    );
    expect(result.consecutiveDays).toBe(1);
  });

  it('keeps adding to existing progress', async () => {
    const { sut, prisma } = makeSut({
      accumulatedDiamonds: 30,
      accumulatedExpirience: 40,
      consecutiveDays: 2,
    });

    await sut.updateUserProgress(1);

    expect(prisma.progress.create).not.toHaveBeenCalled();
    expect(prisma.progress.update.mock.calls[0][0].data).toMatchObject({
      accumulatedDiamonds: 40,
      accumulatedExpirience: 60,
    });
  });
});

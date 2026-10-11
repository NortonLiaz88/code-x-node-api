import { NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateScheduleFormDTO } from './dto/update-schedule.dto';

const data = {
  name: 'Study',
  icon: 'book',
  color: '#fff',
  goalCount: 1,
  goalFrequency: 1,
  days: [],
  timeSlot: 'MORNING',
  remind: true,
} as unknown as UpdateScheduleFormDTO;

const makeSut = () => {
  const prisma = {
    schedule: {
      findFirst: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 5 }),
    },
  };
  const sut = new ProfileService(prisma as any);
  return { sut, prisma };
};

describe('ProfileService.updateUserSchedule', () => {
  it("updates the caller's own schedule", async () => {
    const { sut, prisma } = makeSut();
    prisma.schedule.findFirst.mockResolvedValue({ id: 5, userId: 1 });

    await expect(sut.updateUserSchedule(1, 5, data)).resolves.toEqual({
      id: 5,
    });
    expect(prisma.schedule.findFirst).toHaveBeenCalledWith({
      where: { id: 5, userId: 1 },
    });
  });

  it("returns 404 for another user's schedule and leaves it unchanged", async () => {
    const { sut, prisma } = makeSut();
    prisma.schedule.findFirst.mockResolvedValue(null);

    await expect(sut.updateUserSchedule(2, 5, data)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.schedule.update).not.toHaveBeenCalled();
  });
});

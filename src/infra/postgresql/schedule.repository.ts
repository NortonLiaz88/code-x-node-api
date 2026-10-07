import { UpdateScheduleRepository } from 'src/data/protocols/db/schedule/db-update-schedule-repository';
import { PrismaClientService } from '../orm/prisma/prisma-client.service';
import { UpdateScheduleModel } from 'src/domain/usecases/schedule/update-schedule/update-schedule';
import { Schedule } from 'src/domain/models/schedule';

export class ScheduleRepository implements UpdateScheduleRepository {
  constructor(private readonly ormService: PrismaClientService) {}

  async update(userId: number, data: UpdateScheduleModel): Promise<Schedule> {
    const schedule = await this.ormService.schedule.findUnique({
      where: {
        userId: userId,
      },
    });
    const updatedSchedule = await this.ormService.schedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        ...data,
      },
    });
    return updatedSchedule;
  }
}

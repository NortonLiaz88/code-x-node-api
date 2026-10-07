import { UpdateScheduleRepository } from 'src/data/protocols/db/schedule/db-update-schedule-repository';
import { Schedule } from 'src/domain/models/schedule';
import {
  UpdateSchedule,
  UpdateScheduleModel,
} from 'src/domain/usecases/schedule/update-schedule/update-schedule';

export class DbUpdateSchedule implements UpdateSchedule {
  constructor(
    private readonly updateScheduleRepository: UpdateScheduleRepository,
  ) {}

  async update(userId: number, data: UpdateScheduleModel): Promise<Schedule> {

    const result = await this.updateScheduleRepository.update(userId, data);

    return result;
  }
}

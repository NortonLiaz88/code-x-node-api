import { DbUpdateSchedule } from "src/data/usecases/schedule/update-schedule/update-schedule";
import { ScheduleResponseDto } from "src/main/dto/schedule/schedule.dto";
import { UpdateScheduleDto } from "src/main/dto/schedule/update-schedule/update-schedule.dto";

export class ScheduleService {
  constructor(private readonly dbUpdateSchedule: DbUpdateSchedule) {}

  async update(userId: number, data: UpdateScheduleDto): Promise<ScheduleResponseDto> {
    const result = await this.dbUpdateSchedule.update(userId, data);

    return result;
  }
}
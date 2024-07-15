import { Schedule } from "src/domain/models/schedule";
import { UpdateScheduleModel } from "src/domain/usecases/schedule/update-schedule/update-schedule";

export class UpdateScheduleRepository {
    update: (userId: number, data: UpdateScheduleModel) => Promise<Schedule>;
}
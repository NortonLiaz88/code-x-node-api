import { DbUpdateSchedule } from "src/data/usecases/schedule/update-schedule/update-schedule";
import { PrismaClientService } from "src/infra/orm/prisma/prisma-client.service";
import { ScheduleRepository } from "src/infra/postgresql/schedule.repository";

export const makeDbUpdateSchedule = (): DbUpdateSchedule => {
  const scheduleRepository = new ScheduleRepository(new PrismaClientService());
  return new DbUpdateSchedule(scheduleRepository);
}
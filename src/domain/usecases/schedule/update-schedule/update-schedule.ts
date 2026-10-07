import { DayOfWeek, TimeSlot } from '@prisma/client';
import { Schedule } from 'src/domain/models/schedule';

export interface UpdateScheduleModel {
  name: string;
  icon: string;
  color: string;
  goalCount: number;
  goalFrequency: number;
  days: DayOfWeek[];
  timeSlot: TimeSlot;
  remind: boolean;
}

export interface UpdateSchedule {
  update: (userId: number, schedule: UpdateScheduleModel) => Promise<Schedule>;
}

import { DayOfWeek, TimeSlot } from '@prisma/client';
import { DailyProgress } from './daily-progress';

export class Schedule {
  id: number;
  userId: number;
  name: string;
  icon: string;
  color: string;
  goalCount: number;
  goalFrequency: number;
  days: DayOfWeek[];
  timeSlot: TimeSlot;
  remind: boolean = true;
  dailyProgress?: DailyProgress[];
}

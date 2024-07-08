import { DayOfWeek, TimeSlot } from '../enums';
import { DailyProgress } from './daily-progress';
import { User } from './user';

export class Schedule {
  id: number;
  user: User;
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

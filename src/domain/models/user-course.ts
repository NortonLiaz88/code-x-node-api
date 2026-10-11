import { DailyProgress } from './daily-progress';

export interface UserCourse {
  id: number;
  userId: number;
  active: boolean;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
  dailyProgress?: DailyProgress[];
}

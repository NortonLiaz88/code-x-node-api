import { DailyProgress } from './daily-progress';
import { UserModel } from './user';

export interface UserCourse {
  id: number;
  userId: number;
  active: boolean;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
  dailyProgress?: DailyProgress[];
}

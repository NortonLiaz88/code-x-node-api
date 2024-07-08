import { DailyProgress } from './daily-progress';
import { User } from './user';

export interface UserCourse {
  id: number;
  user: User;
  userId: number;
  active: boolean;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
  dailyProgress?: DailyProgress[];
}

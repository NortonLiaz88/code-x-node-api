import { Schedule } from './schedule';
import { UserCourse } from './user-course';

export interface DailyProgress {
  id: number;
  userCourse: UserCourse;
  userCourseId: number;
  schedule: Schedule;
  scheduleId: number;
  date: Date;
  experience: number;
}

import { Profile } from './profile';
import { Purchase } from './purchase';
import { Schedule } from './schedule';
import { UserCourse } from './user-course';
import { UserPreference } from './user-preference';

export interface UserModel {
  id: number;
  email: string;
  password: string;
  username: string;
  name: string;
  lastName: string;
  phoneNumber: string;
  userCourse?: UserCourse[];
  schedule?: Schedule;
  profile?: Profile;

  userPreference?: UserPreference;
  purchases?: Purchase[];
  diamonds: number;
  experience: number;

  createdAt: Date;
  updatedAt: Date;
}

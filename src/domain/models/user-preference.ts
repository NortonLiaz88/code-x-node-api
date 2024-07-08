import { User } from './user';

export interface UserPreference {
  id: number;
  user: User;
  userId: number;
  soundEffects: boolean;
  vibration: boolean;
  notification: boolean;
}

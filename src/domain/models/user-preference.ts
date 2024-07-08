import { UserModel } from './user';

export interface UserPreference {
  id: number;
  userId: number;
  soundEffects: boolean;
  vibration: boolean;
  notification: boolean;
}

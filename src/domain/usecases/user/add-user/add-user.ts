import { DayOfWeek, Destination, Interest, Knowledge, Language, TimeSlot } from '@prisma/client';
import { GetUserModel, UserModel } from 'src/domain/models/user';

export interface UserCreationProfile {
  knowledge: Knowledge;
  programmingLanguage: Language;
  interests: Interest;
  destination: Destination;
  anotherInterest?: string;
  anotherDestination?: string;
}

export interface UserCreationSchedule {
  name: string;
  icon: string;
  color: string;
  goalCount: number;
  goalFrequency: number;
  days: DayOfWeek[];
  timeSlot: TimeSlot;
  remind: boolean;
}

export interface AddUserModel {
  name: string;
  lastName: string;
  password: string;
  username: string;
  phoneNumber: string;
  email: string;
  profile: UserCreationProfile;
  schedule: UserCreationSchedule;
}

export interface AddUser {
  add: (user: AddUserModel) => Promise<GetUserModel>;
}

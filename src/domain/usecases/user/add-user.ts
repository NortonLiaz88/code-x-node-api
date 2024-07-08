import { Destination, Interest, Knowledge, Language } from 'src/domain/enums';
import { User } from 'src/domain/models/user';

export interface UserCreationProfile {
  knowledge: Knowledge;
  programmingLanguage: Language;
  interests: Interest;
  destination: Destination;
  anotherInterest?: string;
  anotherDestination?: string;
}

export interface AddUserModel {
  name: string;
  lastName: string;
  password: string;
  username: string;
  phoneNumber: string;
  email: string;
  profile: UserCreationProfile;
}

export interface AddUser {
  add: (user: AddUserModel) => Promise<User>;
}

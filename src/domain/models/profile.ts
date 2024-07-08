import { Destination, Interest, Knowledge, Language } from '../enums';
import { User } from './user';

export interface Profile {
  id: number;
  user: User;
  userId: number;
  knowledge: Knowledge;
  profileImage?: string;
  programmingLanguages: Language[];
  activeProgrammingLanguage: Language;
  interests: Interest;
  destination: Destination;
  anotherInterest?: string;
  anotherDestination?: string;
  createdAt: Date;
  updatedAt: Date;
}

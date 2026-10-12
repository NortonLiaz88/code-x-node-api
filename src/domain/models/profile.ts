import { Language, Interest, Destination, Knowledge } from '@prisma/client';

export interface Profile {
  id: number;
  userId: number;
  profileImage?: string;
  programmingLanguages: Language[];
  activeProgrammingLanguage: Language;
  knowledgeLevel?: Knowledge;
  interests: Interest[];
  motivation?: string;
  destination?: Destination;
  anotherInterest?: string;
  anotherDestination?: string;
  createdAt: Date;
  updatedAt: Date;
}

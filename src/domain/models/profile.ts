import {Language, Interest, Destination } from "@prisma/client";

export interface Profile {
  id: number;
  userId: number;
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

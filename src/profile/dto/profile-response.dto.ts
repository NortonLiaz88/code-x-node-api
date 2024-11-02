import { Language, Interest, Destination } from "@prisma/client";

// DTO para Profile
export interface ProfileDTO {
  id: number;
  userId: number;
  profileImage: string | null;
  programmingLanguages: Language[];
  activeProgrammingLanguage: Language;
  interests: Interest;
  destination: Destination;
  anotherInterest: string | null;
  anotherDestination: string | null;
  createdAt: string;
  updatedAt: string;
}

// DTO para User
export interface ProfileResponseDTO {
  id: number;
  email: string;
  password: string;
  username: string;
  name: string;
  lastName: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  diamonds: number;
  experience: number;
  profile: ProfileDTO;
}



import { CourseLevel, Language } from "@prisma/client";

export interface Course {
  id: number;
  language: Language;
  level: CourseLevel;
}

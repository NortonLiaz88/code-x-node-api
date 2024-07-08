import { CourseLevel, Language } from '../enums';

export interface Course {
  id: number;
  language: Language;
  level: CourseLevel;
}

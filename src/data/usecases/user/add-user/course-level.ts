import { CourseLevel, Knowledge } from '@prisma/client';

// The level of the course a new student starts in, from sign-up step 3.
export const courseLevelFor = (knowledge: Knowledge): CourseLevel => {
  switch (knowledge) {
    case Knowledge.MIDDLE:
      return CourseLevel.intermediate;
    case Knowledge.PROFICIENT:
      return CourseLevel.advanced;
    default:
      return CourseLevel.beginner;
  }
};

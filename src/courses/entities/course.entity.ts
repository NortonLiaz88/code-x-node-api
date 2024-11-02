import { Activity, CourseLevel, Language, UserCourse } from "@prisma/client";

export type CourseEntity = {
    id: number 
    name: string
    language: Language
    level: CourseLevel
    userCourse?: UserCourse[]
    activties?: Activity[]
}

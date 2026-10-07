import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegistertUserActivityDto {
    @ApiProperty()
    @IsString()
    courseName: string;

    @ApiProperty()
    @IsString()
    activityId: string;

    @ApiProperty()
    response: string;
}


export class UserActivityResponseDto {
    correct: boolean;
    activityId: number;
    id: number;
    userCourseId: number;
    finished: boolean;
    completionDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
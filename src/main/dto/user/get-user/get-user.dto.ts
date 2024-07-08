import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEmail, IsString, IsOptional, IsArray, IsDate } from 'class-validator';
import { ProfileDto } from '../../profile/profile.dto';
import { PurchaseDto } from '../../purchase/purchase.dto';
import { ScheduleDto } from '../../schedule/schedule.dto';
import { UserCourseDto } from '../../user-course/user-course.dto';
import { UserPreferenceDto } from '../../user-preference/user-preference.dto';


export class UserResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'username' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ type: [UserCourseDto], required: false })
  @IsOptional()
  @IsArray()
  userCourse?: UserCourseDto[];

  @ApiProperty({ type: ScheduleDto, required: false })
  @IsOptional()
  schedule?: ScheduleDto;

  @ApiProperty({ type: ProfileDto, required: false })
  @IsOptional()
  profile?: ProfileDto;

  @ApiProperty({ type: UserPreferenceDto, required: false })
  @IsOptional()
  userPreference?: UserPreferenceDto;

  @ApiProperty({ type: [PurchaseDto], required: false })
  @IsOptional()
  @IsArray()
  purchases?: PurchaseDto[];

  @ApiProperty({ example: 100 })
  @IsInt()
  diamonds: number;

  @ApiProperty({ example: 200.5 })
  @IsInt()
  experience: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDate()
  updatedAt: Date;
}

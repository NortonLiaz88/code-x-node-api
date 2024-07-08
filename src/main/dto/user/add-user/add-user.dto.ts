// user-creation-profile.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProfileDto } from '../../profile/profile.dto';
import { PurchaseDto } from '../../purchase/purchase.dto';
import { ScheduleDto } from '../../schedule/schedule.dto';
import { UserCourseDto } from '../../user-course/user-course.dto';
import { UserPreferenceDto } from '../../user-preference/user-preference.dto';
import { Knowledge, Language, Interest, Destination } from '@prisma/client';

export class UserCreationProfileDto {
  @ApiProperty({ enum: Knowledge })
  @IsEnum(Knowledge)
  knowledge: Knowledge;

  @ApiProperty({ enum: Language })
  @IsEnum(Language)
  programmingLanguage: Language;

  @ApiProperty({ enum: Interest })
  @IsEnum(Interest)
  interests: Interest;

  @ApiProperty({ enum: Destination })
  @IsEnum(Destination)
  destination: Destination;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anotherInterest?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anotherDestination?: string;
}

export class AddUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: UserCreationProfileDto })
  @ValidateNested()
  @Type(() => UserCreationProfileDto)
  profile: UserCreationProfileDto;
}

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

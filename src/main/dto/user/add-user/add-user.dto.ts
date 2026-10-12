// user-creation-profile.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProfileDto } from '../../profile/profile.dto';
import { IsAppPassword } from '../../auth/password-rules';
import { PRIVACY_POLICY_VERSION } from 'src/privacy/privacy-policy';
import { PurchaseDto } from '../../purchase/purchase.dto';
import { ScheduleDto } from '../../schedule/schedule.dto';
import { UserCourseDto } from '../../user-course/user-course.dto';
import { UserPreferenceDto } from '../../user-preference/user-preference.dto';
import {
  Language,
  Interest,
  Destination,
  Knowledge,
  DayOfWeek,
  TimeSlot,
} from '@prisma/client';

export class UserCreationProfileDto {
  @ApiProperty({ enum: Knowledge, description: 'Step 3: knowledge level' })
  @IsEnum(Knowledge)
  knowledge: Knowledge;

  @ApiProperty({ enum: Language, description: 'Step 2: programming language' })
  @IsEnum(Language)
  programmingLanguage: Language;

  @ApiProperty({
    enum: Interest,
    isArray: true,
    description: 'Step 4: topics of interest. A single value is accepted too.',
  })
  // Older app builds send one interest as a plain string.
  @Transform(({ value }) =>
    value === undefined || Array.isArray(value) ? value : [value],
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Interest, { each: true })
  interests: Interest[];

  @ApiPropertyOptional({
    maxLength: 500,
    description: 'Step 5: why the student wants to learn, in their words',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivation?: string;

  @ApiPropertyOptional({ enum: Destination })
  @IsOptional()
  @IsEnum(Destination)
  destination?: Destination;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anotherInterest?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anotherDestination?: string;
}

export class UserCreationSchedule {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  icon: string;

  @ApiProperty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsNumber()
  goalCount: number;

  @ApiProperty()
  @IsNumber()
  goalFrequency: number;

  @ApiProperty({
    enum: DayOfWeek,
    isArray: true,
    description: 'Array of days of the week',
  })
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  days: DayOfWeek[];

  @ApiProperty({ enum: TimeSlot })
  @IsEnum(TimeSlot)
  timeSlot: TimeSlot;

  @ApiProperty({ type: [Boolean], default: true })
  @IsBoolean()
  remind: boolean;
}

export class AddUserDto {
  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // name: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // lastName: string;

  @ApiProperty({ description: 'At least 6 characters and one number' })
  @IsAppPassword()
  password: string;

  @ApiProperty({
    example: PRIVACY_POLICY_VERSION,
    description:
      'The privacy policy version the student accepted (GET /privacy-policy). Must be the current one.',
  })
  @Equals(PRIVACY_POLICY_VERSION, {
    message: 'Aceite a política de privacidade para criar a conta.',
  })
  privacyPolicyVersion: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiPropertyOptional({ example: '+5592991234567' })
  @IsOptional()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'phoneNumber must have 8 to 15 digits',
  })
  phoneNumber?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: UserCreationProfileDto })
  @ValidateNested()
  @Type(() => UserCreationProfileDto)
  profile: UserCreationProfileDto;

  @ApiPropertyOptional({
    type: UserCreationSchedule,
    description: 'Step 6, which arrives in MVP 3',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserCreationSchedule)
  schedule?: UserCreationSchedule;
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

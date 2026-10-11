import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek, TimeSlot } from '@prisma/client';
import { IsString } from 'class-validator';

export class UpdateScheduleFormDTO {
  @ApiProperty()
  name: string;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  @IsString()
  color: string;
  @ApiProperty()
  goalCount: number;
  @ApiProperty()
  goalFrequency: number;
  @ApiProperty()
  days: DayOfWeek[];
  @ApiProperty()
  timeSlot: TimeSlot;
  @ApiProperty()
  remind: boolean;
}

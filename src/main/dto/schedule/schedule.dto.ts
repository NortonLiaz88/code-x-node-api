import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsInt, IsString } from 'class-validator';

export class ScheduleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'My Schedule' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'icon.png' })
  @IsString()
  icon: string;

  @ApiProperty({ example: '#FFFFFF' })
  @IsString()
  color: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  goalCount: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  goalFrequency: number;

  @ApiProperty({ example: ['MONDAY', 'WEDNESDAY', 'FRIDAY'] })
  @IsArray()
  days: string[];

  @ApiProperty({ example: 'MORNING' })
  @IsString()
  timeSlot: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  remind: boolean;

}

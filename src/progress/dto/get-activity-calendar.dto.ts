import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class GetActivityCalendarDto {
  @ApiProperty()
  @IsNumberString()
  userId: number;
  @ApiProperty()
  @IsNumberString()
  month: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt } from 'class-validator';

export class UserPreferenceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  soundEffects: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  vibration: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  notification: boolean;
}

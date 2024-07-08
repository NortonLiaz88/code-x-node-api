import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsInt } from 'class-validator';

export class UserCourseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean;

  @ApiProperty({ example: 100 })
  @IsInt()
  experience: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDate()
  updatedAt: Date;
}

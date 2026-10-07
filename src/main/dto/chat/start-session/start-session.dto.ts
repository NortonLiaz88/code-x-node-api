import { IsUUID, IsInt, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';

export class ChatSessionResponseDto {
  @IsInt()
  @ApiProperty()
  id: number;

  @IsUUID()
  @ApiProperty()
  referenceId: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  name: string | null;

  @IsInt()
  @ApiProperty()
  profileId: number;

  @IsDate()
  @ApiProperty()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @ApiProperty()
  @Type(() => Date)
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class ProfileDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'profile.jpg', required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ example: ['JAVASCRIPT', 'TYPESCRIPT'] })
  @IsArray()
  programmingLanguages: string[];

  @ApiProperty({ example: 'TYPESCRIPT' })
  @IsString()
  activeProgrammingLanguage: string;

  @ApiProperty({ example: 'DEVELOPMENT' })
  @IsString()
  interests: string;

  @ApiProperty({ example: 'FRONTEND' })
  @IsString()
  destination: string;

  @ApiProperty({ example: 'React', required: false })
  @IsOptional()
  @IsString()
  anotherInterest?: string;

  @ApiProperty({ example: 'Backend', required: false })
  @IsOptional()
  @IsString()
  anotherDestination?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  @IsDate()
  updatedAt: Date;
}

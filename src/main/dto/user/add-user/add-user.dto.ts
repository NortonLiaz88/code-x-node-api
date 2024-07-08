// user-creation-profile.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Destination, Interest, Knowledge, Language } from 'src/domain/enums';

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

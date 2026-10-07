import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { DayOfWeek, TimeSlot } from "@prisma/client";
import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsBoolean } from "class-validator";

export class UpdateScheduleDto {
    @ApiPropertyOptional()
    @IsString()
    name: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    icon: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    color: string;
    
    @ApiProperty()
    @IsNumber()
    goalCount: number;
  
    @ApiProperty()
    @IsNumber()
    goalFrequency: number;
  
    @ApiProperty({ enum: DayOfWeek, isArray: true, description: "Array of days of the week" })
    @IsArray()
    @IsEnum(DayOfWeek, { each: true })
    days: DayOfWeek[];
  
    @ApiProperty({ enum: TimeSlot })
    @IsEnum(TimeSlot)
    timeSlot: TimeSlot;
  
    @ApiProperty({ type: [Boolean], default: true})
    @IsBoolean()
    remind: boolean;
  }
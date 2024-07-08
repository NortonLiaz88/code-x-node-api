import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PageableDto {
  @ApiProperty({ default: 1, required: false })
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ default: 10, required: false })
  @IsNumber()
  @Min(1)
  take: number = 10;
}

export class MetaPaginationDTO {
  @ApiProperty()
  total: number;

  @ApiProperty()
  lastPage: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  perPage: number;
}

export class PaginatedResultDTO<T> {
  @ApiProperty()
  meta: MetaPaginationDTO;

  @ApiProperty()
  data: T[];
}

export class MetaPaginationDto {
  @ApiProperty()
  total: number;
  @ApiProperty()
  lastPage: number;
  @ApiProperty()
  currentPage: number;
  @ApiProperty()
  perPage: number;
}

export class PaginationDto {
  @Type(() => String)
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  queryName: string;

  @Type(() => Number)
  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @ApiProperty({ default: 10 })
  @IsNumber()
  @Min(1)
  take: number = 10;
}

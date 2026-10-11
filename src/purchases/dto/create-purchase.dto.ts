import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreatePurchaseDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  itemId: number;
}

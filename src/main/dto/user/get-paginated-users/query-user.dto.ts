import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PageableDto } from '../../commons/pageable.dto';
import { IsOptional, IsString } from 'class-validator';
import { OrderedUserDTO } from './ordered-user.dto';

export class QueryUserDto extends IntersectionType(
  PageableDto,
  OrderedUserDTO,
) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;
}

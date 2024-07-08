import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  OrderByUser,
  OrderUser,
} from 'src/domain/usecases/user/get-all-users/get-paginated-users';

export class OrderedUserDTO {
  @ApiProperty({
    default: OrderByUser.CreatedAt,
    enum: OrderByUser,
    required: false,
  })
  @IsEnum(OrderByUser)
  orderBy: OrderByUser = OrderByUser.CreatedAt;

  @ApiProperty({
    default: OrderUser.Desc,
    enum: OrderUser,
    required: false,
  })
  @IsEnum(OrderUser)
  order: OrderUser = OrderUser.Desc;
}

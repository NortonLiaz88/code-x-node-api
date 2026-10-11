import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedResultDTO } from 'src/main/dto/commons/pageable.dto';
import { UserStrictResponseDto } from 'src/main/dto/user/get-paginated-users/get-users-with-pagination.dto';
import { QueryUserDto } from 'src/main/dto/user/get-paginated-users/query-user.dto';
import { UserResponseDto } from 'src/main/dto/user/get-user/get-user.dto';
import { UserService } from 'src/service/user/user.service';
import { Roles } from 'src/main/usecases/auth/roles.guard';

@ApiBearerAuth()
@ApiTags('users')
@Roles('ADMIN')
@Controller('users')
export class GetUsersContoller {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @ApiResponse({ type: PaginatedResultDTO<UserStrictResponseDto>, status: 200 })
  @HttpCode(200)
  async handle(
    // transform applies the DTO defaults (page 1, take 10, newest first)
    // when the query leaves them out.
    @Query(new ValidationPipe({ transform: true })) query: QueryUserDto,
  ): Promise<PaginatedResultDTO<UserStrictResponseDto>> {
    const response = await this.userService.getAllWithPagination(
      { page: query.page, take: query.take },
      { order: query.order, orderBy: query.orderBy },
      query.search,
    );
    return response;
  }

  @Get('/:id')
  @ApiResponse({ type: UserResponseDto, status: 200 })
  @HttpCode(200)
  async findUser(@Param('id') id: number) {
    const response = await this.userService.getById(+id);
    return response;
  }
}

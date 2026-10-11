import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserResponseDto } from 'src/main/dto/user/get-user/get-user.dto';
import { UserUpdateDto } from 'src/main/dto/user/update-user/update-user.dto';
import { UserService } from 'src/service/user/user.service';
import { Roles } from 'src/main/usecases/auth/roles.guard';

@ApiBearerAuth()
@ApiTags('users')
@Roles('ADMIN')
@Controller('users')
export class UpdateUserController {
  constructor(private readonly userService: UserService) {}

  @Put('/:id')
  @HttpCode(200)
  @ApiResponse({ type: UserResponseDto, status: 200 })
  async update(
    @Body() userData: UserUpdateDto,
    @Param('id') id: number,
  ): Promise<any> {
    const response = await this.userService.updateUser(+id, userData);
    return response;
  }
}

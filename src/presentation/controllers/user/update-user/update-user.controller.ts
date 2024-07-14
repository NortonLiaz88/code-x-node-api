import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOAuth2, ApiBearerAuth } from '@nestjs/swagger';
import { UserResponseDto } from 'src/main/dto/user/get-user/get-user.dto';
import { UserUpdateDto } from 'src/main/dto/user/update-user/update-user.dto';
import { Public } from 'src/main/usecases/auth/auth.guard';
import { UserService } from 'src/service/user/user.service';


@ApiBearerAuth()
@Public()
@ApiTags('users')
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

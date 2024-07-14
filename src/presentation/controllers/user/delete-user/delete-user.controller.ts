import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags, ApiOAuth2, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from 'src/service/user/user.service';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class DeleteUserController {
  constructor(private readonly userService: UserService) {}

  @Delete('/:id')
  @HttpCode(204)
  async delete(@Param('id') id: number): Promise<void> {
    await this.userService.deleteUser(+id);
  }
}

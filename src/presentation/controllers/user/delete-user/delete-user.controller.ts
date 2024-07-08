import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags, ApiOAuth2 } from '@nestjs/swagger';
import { UserService } from 'src/service/user/user.service';


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

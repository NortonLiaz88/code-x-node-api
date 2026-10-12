import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/main/usecases/auth/auth.guard';
import { Roles } from 'src/main/usecases/auth/roles.guard';
import {
  ForgotPasswordDto,
  NewPasswordDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';
import { PasswordResetService } from './password-reset.service';

export const FORGOT_PASSWORD_MESSAGE =
  'Se este email tiver uma conta, enviamos um link para redefinir a senha.';

@ApiTags('auth')
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordReset: PasswordResetService) {}

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Email a password reset link',
    description: 'Answers the same whether or not the email has an account.',
  })
  @ApiResponse({ status: 202 })
  async forgot(@Body() body: ForgotPasswordDto) {
    await this.passwordReset.requestReset(body.email);
    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set a new password with a reset link token' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 400, description: 'Unknown, used or expired token' })
  async reset(@Body() body: ResetPasswordDto) {
    await this.passwordReset.resetPassword(body.token, body.password);
  }
}

@ApiBearerAuth()
@ApiTags('admin')
@Roles('ADMIN')
@Controller('admin/users')
export class AdminPasswordController {
  constructor(private readonly passwordReset: PasswordResetService) {}

  @Post(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Set a user's password (admin fallback)" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'No such user' })
  async setPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: NewPasswordDto,
  ) {
    await this.passwordReset.adminSetPassword(id, body.password);
  }
}

import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
  SetMetadata
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { LoginResponseDto } from 'src/main/dto/auth/login-response.dto';
import { ApiErrorDecorator } from 'src/main/decorators/error.decorator';
import { LoginDto } from 'src/main/dto/auth/login.dto';
import { AddUserDto } from 'src/main/dto/user/add-user/add-user.dto';
import { RefreshTokenDto } from 'src/main/dto/auth/refresh-token.dto';
import { AuthService } from 'src/main/usecases/auth/auth.service';


export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiExtraModels(LoginResponseDto, UnauthorizedException)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiResponse({
    status: 201,
    description: 'User authorized successful',
    schema: { $ref: getSchemaPath(LoginResponseDto) },
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Bad Request')
  @ApiErrorDecorator(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server')
  async login(@Body() body: LoginDto) {
    try {
      console.log('Login With Credentials', body);
      const userValidation = await this.authService.loginWithCredentials({
        email: body.email,
        password: body.password,
      });
      if (!userValidation) {
        throw new UnauthorizedException();
      }
      return userValidation;
    } catch (err) {
      if (err instanceof HttpException) {
        throw new HttpException(err.message, err.getStatus());
      } else {
        throw new HttpException('Server error', 500);
      }
    }
  }

  @Public()
  @Post('refresh-token')
  @ApiResponse({
    status: 201,
    description: 'User authorized successful',
    schema: { $ref: getSchemaPath(LoginResponseDto) },
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Bad Request')
  @ApiErrorDecorator(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server')
  async refreshToken(@Body() body: RefreshTokenDto) {
    try {
      const userValidation = await this.authService.refreshToken(
        body.refreshToken,
      );
      if (!userValidation) {
        throw new UnauthorizedException();
      }
      return userValidation;
    } catch (err) {
      if (err instanceof HttpException) {
        throw new HttpException(err.message, err.getStatus());
      } else {
        throw new HttpException('Server error', 500);
      }
    }
  }

  @Public()
  @Post('sign-up')
  @ApiResponse({
    status: 201,
    description: 'User created successful',
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Bad Request')
  @ApiErrorDecorator(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server')
  async singUp(@Body() body: AddUserDto) {
    try {
      const result = await this.authService.addAccount(body);
      return body;
    } catch (err) {
      if (err instanceof HttpException) {
        return new HttpException(err.message, err.getStatus());
      } else {
        return new HttpException('Server error', 500);
      }
    }
  }
}

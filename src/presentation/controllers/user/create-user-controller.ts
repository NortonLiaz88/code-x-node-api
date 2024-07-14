import { Body, Controller, HttpCode, HttpException, Post, SetMetadata, UnauthorizedException } from "@nestjs/common";
import { ApiExtraModels, ApiTags } from "@nestjs/swagger";
import { LoginResponseDto } from "src/main/dto/auth/login-response.dto";
import { AddUserDto } from "src/main/dto/user/add-user/add-user.dto";
import { UserService } from "src/service/user/user.service";

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiExtraModels(LoginResponseDto, UnauthorizedException)
@ApiTags('auth')
@Controller('users')
export class CreateUserController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Post()
    @HttpCode(200)
    async handle (@Body() addUserDto: AddUserDto) {
        try {
            const user = await this.userService.createUser(addUserDto);
            return user;
        } catch (err) {
            if (err instanceof HttpException) {
                throw new HttpException(err.message, err.getStatus());
              } else {
                throw new HttpException('Server error', 500);
              }
        }
    }
}
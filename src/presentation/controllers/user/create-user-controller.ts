import { Body, Controller, HttpCode, HttpException, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AddUserDto } from "src/main/dto/user/add-user/add-user.dto";
import { UserService } from "src/service/user/user.service";


@ApiTags('users')
@Controller('users')
export class CreateUserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @HttpCode(200)
    async handle (@Body() addUserDto: AddUserDto) {
        try {
            const user = await this.userService.addUser(addUserDto);
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
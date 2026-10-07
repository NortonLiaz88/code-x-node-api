import {
  Controller,
  HttpCode,
  Post,
  Headers,
  Body,
  HttpException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SendMessageDto } from 'src/main/dto/chat/send-message.dto.ts/send-message.dto';
import { AuthService } from 'src/main/usecases/auth/auth.service';
import { ChatService } from 'src/service/chat/chat.service';

@ApiBearerAuth()
@ApiTags('chat')
@Controller('chat')
export class SendMessageController {
  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  @Post('send-message')
  @HttpCode(200)
  async handle(
    @Headers('Authorization') header,
    @Body() body: SendMessageDto,
  ): Promise<any> {
    try {
      const token = header.split('Bearer ')[1];

      const userData = (await this.authService.getUserByToken(token)).payload;

      const response = await this.chatService.sendMessage(userData.profile.id, body.referenceId, body.message);
      console.log(response);

      return response;
    } catch (err) {
      console.log('Error', err);
      if (err instanceof HttpException) {
        throw new HttpException(err.message, err.getStatus());
      } else {
        throw new HttpException('Server error', 500);
      }
    }
  }
}

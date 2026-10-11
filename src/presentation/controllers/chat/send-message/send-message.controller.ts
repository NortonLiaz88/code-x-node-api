import {
  Controller,
  HttpCode,
  Post,
  Headers,
  Body,
  HttpException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatReplyDto } from 'src/main/dto/chat/chat-reply/chat-reply.dto';
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
  @ApiResponse({ type: ChatReplyDto, status: 200 })
  @ApiResponse({
    status: 409,
    description: 'The same clientMessageId is still being answered',
  })
  async handle(
    @Headers('Authorization') header,
    @Body() body: SendMessageDto,
  ): Promise<ChatReplyDto> {
    try {
      const token = header.split('Bearer ')[1];

      const userData = (await this.authService.getUserByToken(token)).payload;

      return await this.chatService.sendMessage(
        userData.profile.id,
        body.referenceId,
        body.message,
        body.clientMessageId,
      );
    } catch (err) {
      if (err instanceof HttpException) {
        throw new HttpException(err.message, err.getStatus());
      } else {
        throw new HttpException('Server error', 500);
      }
    }
  }
}

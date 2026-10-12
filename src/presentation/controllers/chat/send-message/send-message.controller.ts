import { Controller, HttpCode, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatReplyDto } from 'src/main/dto/chat/chat-reply/chat-reply.dto';
import { SendMessageDto } from 'src/main/dto/chat/send-message.dto.ts/send-message.dto';
import { TutorUnavailableDto } from 'src/main/dto/chat/tutor-unavailable.dto';
import { ProfileId } from 'src/main/decorators/profile-id.decorator';
import { ChatService } from 'src/service/chat/chat.service';

@ApiBearerAuth()
@ApiTags('chat')
@Controller('chat')
export class SendMessageController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send-message')
  @HttpCode(200)
  @ApiResponse({ type: ChatReplyDto, status: 200 })
  @ApiResponse({ status: 404, description: 'Not one of your conversations' })
  @ApiResponse({
    status: 409,
    description: 'The same clientMessageId is still being answered',
  })
  @ApiResponse({
    status: 503,
    type: TutorUnavailableDto,
    description: 'The tutor is down, too slow or failed; show `message`',
  })
  async handle(
    @ProfileId() profileId: number,
    @Body() body: SendMessageDto,
  ): Promise<ChatReplyDto> {
    return this.chatService.sendMessage(
      profileId,
      body.referenceId,
      body.message,
      body.clientMessageId,
    );
  }
}

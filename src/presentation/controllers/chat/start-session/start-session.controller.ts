import { Controller, Post, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatSessionResponseDto } from 'src/main/dto/chat/start-session/start-session.dto';
import { ProfileId } from 'src/main/decorators/profile-id.decorator';
import { ChatService } from 'src/service/chat/chat.service';

@ApiBearerAuth()
@ApiTags('chat')
@Controller('chat')
export class StartSessionController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start-session')
  @HttpCode(200)
  @ApiResponse({ type: ChatSessionResponseDto, status: 200 })
  async handle(@ProfileId() profileId: number): Promise<any> {
    return this.chatService.startSession(profileId);
  }
}

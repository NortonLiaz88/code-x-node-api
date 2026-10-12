import { Controller, Get, Param, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ChatConversationDto,
  ChatHistoryMessageDto,
  ChatReferenceParam,
} from 'src/main/dto/chat/history/chat-history.dto';
import { ProfileId } from 'src/main/decorators/profile-id.decorator';
import { ChatService } from 'src/service/chat/chat.service';

@ApiBearerAuth()
@ApiTags('chat')
@Controller('chat/sessions')
export class ChatHistoryController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiResponse({ type: [ChatConversationDto], status: 200 })
  async list(@ProfileId() profileId: number): Promise<ChatConversationDto[]> {
    return this.chatService.getConversations(profileId);
  }

  @Get(':referenceId/messages')
  @ApiResponse({ type: [ChatHistoryMessageDto], status: 200 })
  @ApiResponse({ status: 404, description: 'Not one of your conversations' })
  async messages(
    @ProfileId() profileId: number,
    @Param(new ValidationPipe()) params: ChatReferenceParam,
  ): Promise<ChatHistoryMessageDto[]> {
    return this.chatService.getMessages(profileId, params.referenceId);
  }
}

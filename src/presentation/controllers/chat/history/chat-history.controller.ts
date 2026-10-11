import {
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ChatConversationDto,
  ChatHistoryMessageDto,
  ChatReferenceParam,
} from 'src/main/dto/chat/history/chat-history.dto';
import { AuthService } from 'src/main/usecases/auth/auth.service';
import { ChatService } from 'src/service/chat/chat.service';

@ApiBearerAuth()
@ApiTags('chat')
@Controller('chat/sessions')
export class ChatHistoryController {
  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  @Get()
  @ApiResponse({ type: [ChatConversationDto], status: 200 })
  async list(@Headers('Authorization') header): Promise<ChatConversationDto[]> {
    try {
      const profileId = await this.profileId(header);
      return await this.chatService.getConversations(profileId);
    } catch (err) {
      throw this.toHttp(err);
    }
  }

  @Get(':referenceId/messages')
  @ApiResponse({ type: [ChatHistoryMessageDto], status: 200 })
  @ApiResponse({ status: 404, description: 'Not one of your conversations' })
  async messages(
    @Headers('Authorization') header,
    @Param(new ValidationPipe()) params: ChatReferenceParam,
  ): Promise<ChatHistoryMessageDto[]> {
    try {
      const profileId = await this.profileId(header);
      return await this.chatService.getMessages(profileId, params.referenceId);
    } catch (err) {
      throw this.toHttp(err);
    }
  }

  private async profileId(header: string): Promise<number> {
    const token = header.split('Bearer ')[1];
    const userData = (await this.authService.getUserByToken(token)).payload;
    return userData.profile.id;
  }

  private toHttp(err: unknown): HttpException {
    return err instanceof HttpException
      ? err
      : new HttpException('Server error', 500);
  }
}

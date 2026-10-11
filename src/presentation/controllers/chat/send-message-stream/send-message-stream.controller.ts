import {
  Body,
  Controller,
  Headers,
  HttpException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { formatSse } from 'src/infra/http/chat/sse';
import { SendMessageDto } from 'src/main/dto/chat/send-message.dto.ts/send-message.dto';
import { AuthService } from 'src/main/usecases/auth/auth.service';
import { ChatService } from 'src/service/chat/chat.service';

@ApiBearerAuth()
@ApiTags('chat')
@Controller('chat')
export class SendMessageStreamController {
  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  @Post('send-message/stream')
  @ApiOperation({
    summary: 'Send a message and stream the tutor answer',
    description:
      'Server-sent events: `delta` events `{text}` while the tutor writes, then one `done` event with the ChatReplyDto, or one `error` event `{message}`.',
  })
  @ApiProduces('text/event-stream')
  @ApiResponse({ status: 200, description: 'The event stream' })
  @ApiResponse({ status: 404, description: 'Not one of your conversations' })
  @ApiResponse({
    status: 409,
    description: 'The same clientMessageId is still being answered',
  })
  async handle(
    @Headers('Authorization') header,
    @Body() body: SendMessageDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const abort = new AbortController();
    let events: AsyncGenerator<{ event: string; data: unknown }>;

    try {
      const token = header.split('Bearer ')[1];
      const userData = (await this.authService.getUserByToken(token)).payload;
      // Ownership is checked here, so a refusal is a normal HTTP error.
      events = await this.chatService.streamMessage(
        userData.profile.id,
        body.referenceId,
        body.message,
        abort.signal,
        body.clientMessageId,
      );
    } catch (err) {
      const status = err instanceof HttpException ? err.getStatus() : 500;
      const message =
        err instanceof HttpException ? err.message : 'Server error';
      res.status(status).json({ statusCode: status, message });
      return;
    }

    // Stop asking the tutor once the student leaves.
    req.on('close', () => abort.abort());

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    for await (const item of events) {
      if (abort.signal.aborted) break;
      res.write(formatSse(item.event, item.data));
    }
    res.end();
  }
}

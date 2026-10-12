import { Body, Controller, HttpException, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { formatSse } from 'src/infra/http/chat/sse';
import { SendMessageDto } from 'src/main/dto/chat/send-message.dto.ts/send-message.dto';
import { ProfileId } from 'src/main/decorators/profile-id.decorator';
import { ChatService } from 'src/service/chat/chat.service';
import { Throttle } from '@nestjs/throttler';
import { TUTOR_RATE_LIMIT } from 'src/infra/http/security/rate-limits';

@ApiBearerAuth()
@ApiTags('chat')
@Controller('chat')
export class SendMessageStreamController {
  constructor(private readonly chatService: ChatService) {}

  @Throttle(TUTOR_RATE_LIMIT)
  @Post('send-message/stream')
  @ApiOperation({
    summary: 'Send a message and stream the tutor answer',
    description:
      'Server-sent events: `delta` events `{text}` while the tutor writes, then one `done` event with the ChatReplyDto, or one `error` event `{message, reason?}`. `reason` is `unreachable`, `timeout` or `failed` when the tutor itself is the problem; show `message`.',
  })
  @ApiProduces('text/event-stream')
  @ApiResponse({ status: 200, description: 'The event stream' })
  @ApiResponse({ status: 404, description: 'Not one of your conversations' })
  @ApiResponse({
    status: 409,
    description: 'The same clientMessageId is still being answered',
  })
  async handle(
    @ProfileId() profileId: number,
    @Body() body: SendMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    const abort = new AbortController();
    let events: AsyncGenerator<{ event: string; data: unknown }>;

    try {
      // Ownership is checked here, so a refusal is a normal HTTP error.
      events = await this.chatService.streamMessage(
        profileId,
        body.referenceId,
        body.message,
        abort.signal,
        body.clientMessageId,
      );
    } catch (err) {
      if (err instanceof HttpException) {
        res.status(err.getStatus()).json(err.getResponse());
      } else {
        res.status(500).json({ statusCode: 500, message: 'Server error' });
      }
      return;
    }

    // Stop asking the tutor once the student leaves. The request has already
    // been read (and closed) by now, so it's the response that tells.
    res.on('close', () => {
      if (!res.writableEnded) abort.abort();
    });

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

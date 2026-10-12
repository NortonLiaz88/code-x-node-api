import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DbStartSession } from 'src/data/usecases/chat/db-start-session';
import {
  Session,
  TUTOR_SESSIONS_CONNECTION,
} from 'src/infra/mongodb/chat/model';
import { RemoteSendMessage } from 'src/data/usecases/chat/http-send-mesage';
import { InjectModel } from '@nestjs/mongoose';
import {
  ChatReplyDto,
  ChatStreamEvent,
  MAX_QUICK_REPLIES,
} from 'src/main/dto/chat/chat-reply/chat-reply.dto';
import { ChatPostgresRepository } from 'src/infra/postgresql/chat.repository';
import {
  ChatConversationDto,
  ChatHistoryMessageDto,
} from 'src/main/dto/chat/history/chat-history.dto';
import {
  TutorUnavailableDto,
  TutorUnavailableException,
} from 'src/main/dto/chat/tutor-unavailable.dto';
import {
  TutorMetricInput,
  TutorMetricsRepository,
  TutorOutcome,
} from 'src/infra/postgresql/tutor-metrics.repository';
import { TutorAnswer } from 'src/domain/usecases/chat/send-message/send-message';

const failureOf = (err: unknown): TutorOutcome =>
  err instanceof TutorUnavailableException
    ? (err.getResponse() as TutorUnavailableDto).reason
    : 'failed';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Session.name, TUTOR_SESSIONS_CONNECTION)
    private sessionModel: Model<Session>,
    @Inject() private readonly dbStartSession: DbStartSession,
    @Inject() private readonly httpSendMessage: RemoteSendMessage,
    @Inject() private readonly chatRepository: ChatPostgresRepository,
    @Inject() private readonly tutorMetrics: TutorMetricsRepository,
  ) {}

  private readonly logger = new Logger(ChatService.name);

  async startSession(profileId: number): Promise<ChatModel> {
    const session = new this.sessionModel({ id: uuidv4() });
    await session.save();

    const chat = await this.dbStartSession.startSession(profileId, session.id);
    return chat;
  }

  async sendMessage(
    profileId: number,
    referenceId: string,
    message: string,
    clientMessageId?: string,
  ): Promise<ChatReplyDto> {
    const chat = await this.getOwnChat(profileId, referenceId);
    const claim = await this.claim(chat, clientMessageId);
    if ('reply' in claim) return claim.reply;

    const started = Date.now();
    let answer: TutorAnswer;
    try {
      answer = await this.httpSendMessage.sendMessage(
        profileId,
        referenceId,
        message,
      );
    } catch (err) {
      await this.release(claim.reservationId);
      await this.recordMetric({
        chatId: chat.id,
        outcome: failureOf(err),
        latencyMs: Date.now() - started,
        streamed: false,
      });
      throw err;
    }
    await this.finish(chat, claim.reservationId, answer.reply);
    await this.recordMetric({
      chatId: chat.id,
      outcome: 'answered',
      latencyMs: Date.now() - started,
      replyChars: answer.reply.answer.length,
      ...answer.meta,
      streamed: false,
    });
    return answer.reply;
  }

  /**
   * Checks the chat belongs to the caller before anything is streamed, then
   * relays the tutor's events and records the message once it is done.
   */
  async streamMessage(
    profileId: number,
    referenceId: string,
    message: string,
    signal?: AbortSignal,
    clientMessageId?: string,
  ): Promise<AsyncGenerator<ChatStreamEvent>> {
    const chat = await this.getOwnChat(profileId, referenceId);
    const claim = await this.claim(chat, clientMessageId);
    if ('reply' in claim) {
      const { reply } = claim;
      return (async function* (): AsyncGenerator<ChatStreamEvent> {
        yield { event: 'done', data: reply };
      })();
    }

    const events = this.httpSendMessage.streamMessage(
      referenceId,
      message,
      signal,
    );
    const finish = (reply: ChatReplyDto) =>
      this.finish(chat, claim.reservationId, reply);
    const release = () => this.release(claim.reservationId);
    const record = (metric: Omit<TutorMetricInput, 'chatId' | 'streamed'>) =>
      this.recordMetric({ ...metric, chatId: chat.id, streamed: true });

    return (async function* (): AsyncGenerator<ChatStreamEvent> {
      const started = Date.now();
      let firstTextMs: number | null = null;
      // Stays 'left' when the student closes the stream before it ends.
      let outcome: TutorOutcome = 'left';
      let answered: ChatStreamEvent & { event: 'done' };
      try {
        for await (const item of events) {
          if (item.event === 'delta' && firstTextMs === null) {
            firstTextMs = Date.now() - started;
          }
          if (item.event === 'error') outcome = item.data.reason ?? 'failed';
          if (item.event === 'done') {
            await finish(item.data);
            outcome = 'answered';
            answered = item;
            yield { event: 'done', data: item.data };
          } else {
            yield item;
          }
        }
      } finally {
        // An error or a student who left frees the id for a retry.
        if (outcome !== 'answered') await release();
        await record({
          outcome,
          latencyMs: Date.now() - started,
          firstTextMs,
          replyChars: answered?.data.answer.length ?? 0,
          ...answered?.meta,
        });
      }
    })();
  }

  /**
   * Without a clientMessageId every send asks the tutor. With one, only the
   * first send does; a repeat gets the stored reply, or a 409 while the
   * first is still being answered.
   */
  private async claim(
    chat: ChatModel,
    clientMessageId?: string,
  ): Promise<{ reservationId: number | null } | { reply: ChatReplyDto }> {
    if (!clientMessageId) return { reservationId: null };

    const result = await this.chatRepository.reserveReply(
      chat.id,
      clientMessageId,
    );
    if ('reservationId' in result) return result;
    if (result.existing.answer === null) {
      throw new ConflictException('This question is still being answered');
    }
    return {
      reply: {
        answer: result.existing.answer,
        quickReplies: result.existing.quickReplies,
        topic: result.existing.topic ?? '',
      },
    };
  }

  private async finish(
    chat: ChatModel,
    reservationId: number | null,
    reply: ChatReplyDto,
  ): Promise<void> {
    if (reservationId !== null) {
      await this.chatRepository.saveReply(reservationId, reply);
    }
    await this.chatRepository.recordMessage(chat, reply.topic);
  }

  // Metrics never get in the way of an answer.
  private async recordMetric(metric: TutorMetricInput): Promise<void> {
    try {
      await this.tutorMetrics.record(metric);
    } catch (err) {
      this.logger.warn(`Could not record a tutor metric: ${err}`);
    }
  }

  private async release(reservationId: number | null): Promise<void> {
    if (reservationId !== null) {
      await this.chatRepository.releaseReply(reservationId);
    }
  }

  async getConversations(profileId: number): Promise<ChatConversationDto[]> {
    const chats = await this.chatRepository.getConversations(profileId);
    return chats.map((chat) => ({
      referenceId: chat.referenceId,
      topic: chat.topic ?? '',
      createdAt: chat.createdAt,
      lastMessageAt: chat.lastMessageAt,
    }));
  }

  async getMessages(
    profileId: number,
    referenceId: string,
  ): Promise<ChatHistoryMessageDto[]> {
    await this.getOwnChat(profileId, referenceId);
    const session = await this.sessionModel
      .findOne({ id: referenceId })
      .lean()
      .exec();

    return (session?.messages ?? [])
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        quickReplies:
          m.role === 'assistant'
            ? (m.tooltip ?? []).slice(0, MAX_QUICK_REPLIES)
            : [],
      }));
  }

  // Someone else's conversation answers the same as a missing one.
  private async getOwnChat(
    profileId: number,
    referenceId: string,
  ): Promise<ChatModel> {
    const chat = await this.chatRepository.getChatByReference(
      profileId,
      referenceId,
    );
    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }
}

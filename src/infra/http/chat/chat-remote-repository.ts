import { HttpService } from '@nestjs/axios';
import { Readable } from 'stream';
import { firstValueFrom } from 'rxjs';
import {
  SendMessageRepository,
  TutorStreamEvent,
  TutorUnavailableError,
} from 'src/data/protocols/db/chat/db-send-message-repository';
import {
  TutorReply,
  TutorScenario,
} from 'src/main/dto/chat/chat-reply/chat-reply.dto';
import { parseSse } from './sse';
import { TutorConfig, tutorConfig } from './tutor-config';
import { toTutorError } from './tutor-errors';

interface TutorResponse {
  messages?: TutorReply[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls code-x-ai. Every failure comes out as a TutorUnavailableError: a
 * tutor that can't be reached is tried once more, and one that stays silent
 * past the timeout is given up on.
 */
export class ChatRemoteRepository implements SendMessageRepository {
  constructor(
    private readonly http: HttpService,
    private readonly config: TutorConfig = tutorConfig(),
  ) {}

  async sendMessage(
    profileId: number,
    referenceId: string,
    message: string,
    scenario?: TutorScenario,
  ): Promise<TutorReply> {
    const response = await this.withRetry(() =>
      firstValueFrom(
        this.http.post<TutorResponse>(
          `${this.config.url}/response`,
          { session_id: referenceId, message, scenario },
          { timeout: this.config.timeoutMs },
        ),
      ),
    );
    // The tutor answers with { messages: [reply] }.
    const reply = response.data?.messages?.[0];
    if (!reply) throw new TutorUnavailableError('failed');
    return reply;
  }

  /** Reads the tutor's SSE stream (POST /response/stream). */
  async *streamMessage(
    referenceId: string,
    message: string,
    signal?: AbortSignal,
    scenario?: TutorScenario,
  ): AsyncGenerator<TutorStreamEvent> {
    const request = new AbortController();
    const stop = () => request.abort();
    signal?.addEventListener('abort', stop);

    let timedOut = false;
    let timer: NodeJS.Timeout | undefined;
    const restartTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        timedOut = true;
        request.abort();
      }, this.config.timeoutMs);
    };

    try {
      restartTimer();
      const response = await this.withRetry(() =>
        this.http.axiosRef.post<Readable>(
          `${this.config.url}/response/stream`,
          { session_id: referenceId, message, scenario },
          { responseType: 'stream', signal: request.signal, timeout: 0 },
        ),
      );

      for await (const { event, data } of parseSse(response.data)) {
        restartTimer();
        const payload = JSON.parse(data);
        if (event === 'delta')
          yield { type: 'delta', text: payload.text ?? '' };
        else if (event === 'done') yield { type: 'done', reply: payload };
        else if (event === 'error') yield { type: 'error' };
      }
    } catch (err) {
      if (signal?.aborted) throw err;
      throw timedOut
        ? new TutorUnavailableError('timeout', err)
        : toTutorError(err);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', stop);
    }
  }

  private async withRetry<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (err) {
      const error = toTutorError(err);
      if (error.reason !== 'unreachable') throw error;
    }
    await sleep(this.config.retryDelayMs);
    try {
      return await call();
    } catch (err) {
      throw toTutorError(err);
    }
  }
}

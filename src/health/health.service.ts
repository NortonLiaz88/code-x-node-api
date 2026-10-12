import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { TUTOR_SESSIONS_CONNECTION } from 'src/infra/mongodb/chat/model';
import { tutorConfig } from 'src/infra/http/chat/tutor-config';

export type CheckState = 'up' | 'down';

export interface HealthReport {
  /** ok: everything up. degraded: the API works but the tutor doesn't. down: the API can't serve. */
  status: 'ok' | 'degraded' | 'down';
  checks: { postgres: CheckState; mongo: CheckState; tutor: CheckState };
}

export const HEALTH_CHECK_TIMEOUT_MS = 3_000;

const withTimeout = <T>(work: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });

const state = async (
  check: () => Promise<unknown>,
  ms = HEALTH_CHECK_TIMEOUT_MS,
): Promise<CheckState> => {
  try {
    await withTimeout(check(), ms);
    return 'up';
  } catch {
    return 'down';
  }
};

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaClientService,
    @InjectConnection() private readonly lessons: Connection,
    @InjectConnection(TUTOR_SESSIONS_CONNECTION)
    private readonly sessions: Connection,
  ) {}

  async check(): Promise<HealthReport> {
    const [postgres, lessons, sessions, tutor] = await Promise.all([
      state(() => this.prisma.$queryRaw`SELECT 1`),
      state(() => this.lessons.db.admin().ping()),
      state(() => this.sessions.db.admin().ping()),
      state(() => this.pingTutor()),
    ]);
    const mongo: CheckState =
      lessons === 'up' && sessions === 'up' ? 'up' : 'down';
    const status =
      postgres === 'down' || mongo === 'down'
        ? 'down'
        : tutor === 'down'
          ? 'degraded'
          : 'ok';
    return { status, checks: { postgres, mongo, tutor } };
  }

  /** Any HTTP answer means the tutor process is reachable. */
  private async pingTutor(): Promise<void> {
    const { url } = tutorConfig();
    if (!url) throw new Error('TUTOR_URL is not set');
    await fetch(url, { signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS) });
  }
}

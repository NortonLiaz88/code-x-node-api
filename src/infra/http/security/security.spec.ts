import { Controller, INestApplication, Post } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Throttle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';

import { corsOrigins, trustProxy } from './http-options';
import {
  AUTH_RATE_LIMIT,
  DEFAULT_RATE_LIMIT,
  RATE_LIMIT_MESSAGE,
} from './rate-limits';
import { RequestLoggerMiddleware } from './request-logger.middleware';

@Controller()
class LimitedController {
  @Throttle(AUTH_RATE_LIMIT)
  @Post('login')
  login() {
    return { ok: true };
  }
}

describe('rate limits', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [{ name: 'default', ...DEFAULT_RATE_LIMIT }],
          errorMessage: RATE_LIMIT_MESSAGE,
        }),
      ],
      controllers: [LimitedController],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('answers 429 in Portuguese after 10 logins in a minute', async () => {
    for (let i = 0; i < AUTH_RATE_LIMIT.default.limit; i++) {
      await request(app.getHttpServer()).post('/login').expect(201);
    }
    const res = await request(app.getHttpServer()).post('/login').expect(429);
    expect(res.body.message).toBe(RATE_LIMIT_MESSAGE);
  });
});

describe('http options', () => {
  it('reads CORS origins from a comma separated list', () => {
    expect(corsOrigins({})).toEqual([]);
    expect(
      corsOrigins({ CORS_ORIGINS: 'https://a.dev, https://b.dev,' }),
    ).toEqual(['https://a.dev', 'https://b.dev']);
  });

  it('trusts proxies only when TRUST_PROXY is a hop count', () => {
    expect(trustProxy({})).toBe(false);
    expect(trustProxy({ TRUST_PROXY: 'true' })).toBe(false);
    expect(trustProxy({ TRUST_PROXY: '1' })).toBe(1);
  });
});

describe('RequestLoggerMiddleware', () => {
  const run = (url: string, status: number, user?: string) => {
    const middleware = new RequestLoggerMiddleware();
    const log = jest
      .spyOn(
        (middleware as unknown as { logger: { log: () => void } }).logger,
        'log',
      )
      .mockImplementation(() => undefined);
    let finish: () => void = () => undefined;
    const req = {
      method: 'POST',
      originalUrl: url,
      body: { password: 'secret' },
      user: user ? { payload: { id: user } } : undefined,
    };
    const res = {
      statusCode: status,
      on: (_: string, cb: () => void) => (finish = cb),
    };
    middleware.use(req as never, res as never, () => undefined);
    finish();
    return log;
  };

  it('logs method, path without query, status and user, never the body', () => {
    const log = run('/auth/login?token=abc', 201, 'u1');
    expect(log).toHaveBeenCalledTimes(1);
    const line = (log.mock.calls[0] as unknown[])[0] as string;
    expect(line).toMatch(/^POST \/auth\/login 201 \d+ms user=u1$/);
    expect(line).not.toContain('abc');
    expect(line).not.toContain('secret');
  });

  it('skips successful health checks but logs failing ones', () => {
    expect(run('/health', 200)).not.toHaveBeenCalled();
    expect(run('/health', 503)).toHaveBeenCalledTimes(1);
  });
});

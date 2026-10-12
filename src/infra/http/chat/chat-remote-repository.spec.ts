import { HttpService } from '@nestjs/axios';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { TutorUnavailableError } from 'src/data/protocols/db/chat/db-send-message-repository';
import { ChatRemoteRepository } from './chat-remote-repository';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

describe('ChatRemoteRepository', () => {
  let server: Server;
  let url: string;
  let handler: Handler;
  let calls: number;

  beforeAll(async () => {
    server = createServer((req, res) => {
      calls += 1;
      handler(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    calls = 0;
  });

  const repo = (tutorUrl = url, timeoutMs = 300) =>
    new ChatRemoteRepository(new HttpService(), {
      url: tutorUrl,
      timeoutMs,
      retryDelayMs: 10,
    });

  const failure = async (promise: Promise<unknown>) => {
    const err = await promise.catch((e) => e);
    expect(err).toBeInstanceOf(TutorUnavailableError);
    return (err as TutorUnavailableError).reason;
  };

  const drain = async (events: AsyncGenerator<unknown>) => {
    const items = [];
    for await (const item of events) items.push(item);
    return items;
  };

  // A port nothing listens on.
  const closedPort = async () => {
    const probe = createServer();
    await new Promise<void>((resolve) => probe.listen(0, resolve));
    const { port } = probe.address() as AddressInfo;
    await new Promise((resolve) => probe.close(resolve));
    return `http://127.0.0.1:${port}`;
  };

  describe('sendMessage', () => {
    it('returns the first reply', async () => {
      handler = (_, res) =>
        res.end(JSON.stringify({ messages: [{ answer: 'Oi', tooltip: [] }] }));

      await expect(repo().sendMessage(1, 'ref', 'Oi')).resolves.toEqual({
        answer: 'Oi',
        tooltip: [],
      });
    });

    it('gives up after the timeout, without asking twice', async () => {
      handler = () => undefined; // never answers

      expect(await failure(repo().sendMessage(1, 'ref', 'Oi'))).toBe('timeout');
      expect(calls).toBe(1);
    });

    it('reports a tutor error as failed, without asking twice', async () => {
      handler = (_, res) => {
        res.statusCode = 500;
        res.end('boom');
      };

      expect(await failure(repo().sendMessage(1, 'ref', 'Oi'))).toBe('failed');
      expect(calls).toBe(1);
    });

    it('reports an empty answer as failed', async () => {
      handler = (_, res) => res.end(JSON.stringify({ messages: [] }));

      expect(await failure(repo().sendMessage(1, 'ref', 'Oi'))).toBe('failed');
    });

    it('reports a tutor that is down as unreachable', async () => {
      const down = repo(await closedPort());
      const post = jest.spyOn(
        (down as unknown as { http: HttpService }).http,
        'post',
      );

      expect(await failure(down.sendMessage(1, 'ref', 'Oi'))).toBe(
        'unreachable',
      );
      expect(post).toHaveBeenCalledTimes(2); // one retry
    });
  });

  describe('streamMessage', () => {
    const sse = (res: ServerResponse, event: string, data: unknown) =>
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

    it('relays deltas and the final reply', async () => {
      handler = (_, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        sse(res, 'delta', { text: 'Uma ' });
        sse(res, 'done', { answer: 'Uma pilha.' });
        res.end();
      };

      expect(await drain(repo().streamMessage('ref', 'Oi'))).toEqual([
        { type: 'delta', text: 'Uma ' },
        { type: 'done', reply: { answer: 'Uma pilha.' } },
      ]);
    });

    it('waits as long as events keep coming', async () => {
      handler = (_, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        let sent = 0;
        const tick = setInterval(() => {
          sent += 1;
          if (sent < 4) return void sse(res, 'delta', { text: `${sent} ` });
          clearInterval(tick);
          sse(res, 'done', { answer: '1 2 3' });
          res.end();
        }, 150);
      };

      // 4 × 150 ms is longer than the 300 ms timeout, but no gap is.
      const items = await drain(repo().streamMessage('ref', 'Oi'));
      expect(items[items.length - 1]).toEqual({
        type: 'done',
        reply: { answer: '1 2 3' },
      });
    });

    it('gives up when the stream goes quiet', async () => {
      handler = (_, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        sse(res, 'delta', { text: 'Uma ' }); // then nothing
      };

      const events = repo().streamMessage('ref', 'Oi');
      const items = [];
      const reason = await failure(
        (async () => {
          for await (const item of events) items.push(item);
        })(),
      );
      expect(reason).toBe('timeout');
      expect(items).toEqual([{ type: 'delta', text: 'Uma ' }]);
    });

    it('reports a tutor that is down as unreachable after one retry', async () => {
      const down = repo(await closedPort());
      const post = jest.spyOn(
        (down as unknown as { http: HttpService }).http.axiosRef,
        'post',
      );

      expect(await failure(drain(down.streamMessage('ref', 'Oi')))).toBe(
        'unreachable',
      );
      expect(post).toHaveBeenCalledTimes(2);
    });

    it('stops quietly when the student leaves', async () => {
      handler = (_, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        sse(res, 'delta', { text: 'Uma ' });
      };
      const student = new AbortController();
      const events = repo(url, 5_000).streamMessage(
        'ref',
        'Oi',
        student.signal,
      );

      await events.next();
      student.abort();
      const err = await events.next().catch((e) => e);
      expect(err).not.toBeInstanceOf(TutorUnavailableError);
    });
  });
});

import { HealthService } from './health.service';

const connection = (ping: () => Promise<unknown>) =>
  ({ db: { admin: () => ({ ping }) } }) as never;

const up = () => Promise.resolve({ ok: 1 });
const down = () => Promise.reject(new Error('no'));

const service = (
  opts: {
    postgres?: () => Promise<unknown>;
    lessons?: () => Promise<unknown>;
    sessions?: () => Promise<unknown>;
  } = {},
) =>
  new HealthService(
    { $queryRaw: opts.postgres ?? up } as never,
    connection(opts.lessons ?? up),
    connection(opts.sessions ?? up),
  );

describe('HealthService', () => {
  const fetchMock = jest.fn();
  const realFetch = global.fetch;

  beforeEach(() => {
    process.env.TUTOR_URL = 'http://tutor:80';
    fetchMock.mockReset().mockResolvedValue({ status: 404 });
    global.fetch = fetchMock as never;
  });

  afterAll(() => {
    global.fetch = realFetch;
  });

  it('is ok when everything answers, even a 404 from the tutor', async () => {
    await expect(service().check()).resolves.toEqual({
      status: 'ok',
      checks: { postgres: 'up', mongo: 'up', tutor: 'up' },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://tutor:80',
      expect.anything(),
    );
  });

  it('is degraded when only the tutor is down', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const report = await service().check();
    expect(report.status).toBe('degraded');
    expect(report.checks.tutor).toBe('down');
  });

  it('is down when Postgres is down', async () => {
    const report = await service({ postgres: down }).check();
    expect(report).toEqual({
      status: 'down',
      checks: { postgres: 'down', mongo: 'up', tutor: 'up' },
    });
  });

  it('is down when either Mongo connection is down', async () => {
    expect((await service({ sessions: down }).check()).status).toBe('down');
    expect((await service({ lessons: down }).check()).checks.mongo).toBe(
      'down',
    );
  });

  it('counts a check that hangs as down', async () => {
    jest.useFakeTimers();
    const pending = service({ postgres: () => new Promise(() => {}) }).check();
    await jest.advanceTimersByTimeAsync(3_000);
    expect((await pending).checks.postgres).toBe('down');
    jest.useRealTimers();
  });

  it('reports the tutor down when TUTOR_URL is missing', async () => {
    delete process.env.TUTOR_URL;
    expect((await service().check()).checks.tutor).toBe('down');
  });
});

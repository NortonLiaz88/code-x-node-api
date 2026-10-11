import { formatSse, parseSse } from './sse';

const collect = async (chunks: (string | Buffer)[]) => {
  async function* source() {
    yield* chunks;
  }
  const events = [];
  for await (const event of parseSse(source())) events.push(event);
  return events;
};

describe('server-sent events', () => {
  it('reads events split across chunks, including multi-byte characters', async () => {
    const raw = Buffer.from(
      'event: delta\ndata: {"text":"Laço"}\n\nevent: done\ndata: {"answer":"ok"}\n\n',
    );
    const chunks = [raw.subarray(0, 7), raw.subarray(7, 33), raw.subarray(33)];

    expect(await collect(chunks)).toEqual([
      { event: 'delta', data: '{"text":"Laço"}' },
      { event: 'done', data: '{"answer":"ok"}' },
    ]);
  });

  it('accepts CRLF line endings and a last event without a blank line', async () => {
    expect(await collect(['event: done\r\ndata: {}'])).toEqual([
      { event: 'done', data: '{}' },
    ]);
  });

  it('formats an event the same parser reads back', async () => {
    const text = formatSse('delta', { text: 'a\nb' });

    expect(await collect([text])).toEqual([
      { event: 'delta', data: '{"text":"a\\nb"}' },
    ]);
  });
});

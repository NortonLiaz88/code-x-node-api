import { RemoteSendMessage } from './http-send-mesage';

describe('RemoteSendMessage', () => {
  it('returns the typed reply built from the tutor answer', async () => {
    const remote = {
      streamMessage: jest.fn(),
      sendMessage: jest.fn().mockResolvedValue({
        answer: 'Use for.',
        tooltip: ['Ver exemplo'],
        topic: 'Laços',
      }),
    };
    const usecase = new RemoteSendMessage(remote);

    const reply = await usecase.sendMessage(1, 'ref', 'O que é um laço?');

    expect(remote.sendMessage).toHaveBeenCalledWith(
      1,
      'ref',
      'O que é um laço?',
    );
    expect(reply).toEqual({
      answer: 'Use for.',
      quickReplies: ['Ver exemplo'],
      topic: 'Laços',
    });
  });
});

describe('RemoteSendMessage.streamMessage', () => {
  const run = async (items: unknown[] | Error, signal?: AbortSignal) => {
    const remote = {
      sendMessage: jest.fn(),
      streamMessage: jest.fn(async function* () {
        if (items instanceof Error) throw items;
        yield* items as any[];
      }),
    };
    const events = [];
    for await (const event of new RemoteSendMessage(remote).streamMessage(
      'ref',
      'Oi',
      signal,
    )) {
      events.push(event);
    }
    return events;
  };

  it('relays deltas and ends with the typed reply', async () => {
    const events = await run([
      { type: 'delta', text: 'Uma pilha. ' },
      {
        type: 'done',
        reply: {
          answer: 'Uma pilha.',
          tooltip: ['a', 'b', 'c', 'd'],
          topic: 'Pilhas',
        },
      },
    ]);

    expect(events).toEqual([
      { event: 'delta', data: { text: 'Uma pilha. ' } },
      {
        event: 'done',
        data: {
          answer: 'Uma pilha.',
          quickReplies: ['a', 'b', 'c'],
          topic: 'Pilhas',
        },
      },
    ]);
  });

  it('ends with an error when the tutor stops early, fails or reports one', async () => {
    for (const items of [
      [{ type: 'delta', text: 'Uma' }],
      new Error('tutor down'),
      [{ type: 'error' }],
    ]) {
      const events = await run(items);
      expect(events[events.length - 1].event).toBe('error');
    }
  });

  it('stays quiet when the student already left', async () => {
    const abort = new AbortController();
    abort.abort();

    expect(await run(new Error('aborted'), abort.signal)).toEqual([]);
  });
});

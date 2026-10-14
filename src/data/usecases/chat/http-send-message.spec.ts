import { TutorUnavailableError } from 'src/data/protocols/db/chat/db-send-message-repository';
import {
  TUTOR_UNAVAILABLE_MESSAGES,
  TutorUnavailableException,
} from 'src/main/dto/chat/tutor-unavailable.dto';
import { RemoteSendMessage } from './http-send-mesage';

describe('RemoteSendMessage', () => {
  it('returns the typed reply built from the tutor answer', async () => {
    const remote = {
      streamMessage: jest.fn(),
      sendMessage: jest.fn().mockResolvedValue({
        answer: 'Use for.',
        tooltip: ['Ver exemplo'],
        topic: 'Laços',
        scenario: 'concept',
      }),
    };
    const usecase = new RemoteSendMessage(remote);

    const reply = await usecase.sendMessage(
      1,
      'ref',
      'O que é um laço?',
      'concept',
    );

    expect(remote.sendMessage).toHaveBeenCalledWith(
      1,
      'ref',
      'O que é um laço?',
      'concept',
    );
    expect(reply).toEqual({
      reply: {
        answer: 'Use for.',
        quickReplies: ['Ver exemplo'],
        topic: 'Laços',
        scenario: 'concept',
      },
      meta: { provider: null, model: null },
    });
  });
});

describe('RemoteSendMessage when the tutor is unavailable', () => {
  it('answers with a typed 503 and a message for the student', async () => {
    const remote = {
      streamMessage: jest.fn(),
      sendMessage: jest
        .fn()
        .mockRejectedValue(new TutorUnavailableError('timeout')),
    };

    const err = await new RemoteSendMessage(remote)
      .sendMessage(1, 'ref', 'Oi')
      .catch((e) => e);

    expect(err).toBeInstanceOf(TutorUnavailableException);
    expect(err.getStatus()).toBe(503);
    expect(err.getResponse()).toEqual({
      statusCode: 503,
      error: 'TUTOR_UNAVAILABLE',
      reason: 'timeout',
      message: TUTOR_UNAVAILABLE_MESSAGES.timeout,
    });
  });

  it('ends the stream with the same message and reason', async () => {
    const remote = {
      sendMessage: jest.fn(),
      streamMessage: jest.fn(async function* () {
        yield { type: 'delta' as const, text: 'Uma' };
        throw new TutorUnavailableError('unreachable');
      }),
    };
    const events = [];
    for await (const event of new RemoteSendMessage(remote).streamMessage(
      'ref',
      'Oi',
    )) {
      events.push(event);
    }

    expect(events[events.length - 1]).toEqual({
      event: 'error',
      data: {
        message: TUTOR_UNAVAILABLE_MESSAGES.unreachable,
        reason: 'unreachable',
      },
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

  it('relays deltas and ends with the typed reply and the model', async () => {
    const events = await run([
      { type: 'delta', text: 'Uma pilha. ' },
      {
        type: 'done',
        reply: {
          answer: 'Uma pilha.',
          tooltip: ['a', 'b', 'c', 'd'],
          topic: 'Pilhas',
          provider: 'ollama',
          model: 'qwen2.5:7b',
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
          scenario: '',
        },
        meta: { provider: 'ollama', model: 'qwen2.5:7b' },
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

import { ConflictException, NotFoundException } from '@nestjs/common';
import { TutorUnavailableException } from 'src/main/dto/chat/tutor-unavailable.dto';
import { ChatService } from './chat.service';

const chat = {
  id: 7,
  referenceId: '5b8f2c1e-1f3a-4c1d-9a0e-2f6c9d1e7a10',
  profileId: 1,
  topic: null,
  createdAt: new Date('2026-10-11T10:00:00Z'),
  lastMessageAt: new Date('2026-10-11T10:05:00Z'),
};

const makeService = (sessionDoc: unknown = null) => {
  const sessionModel = {
    findOne: jest.fn().mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve(sessionDoc) }),
    }),
    find: jest.fn().mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve([{ id: chat.referenceId, scenario: null }]),
      }),
    }),
  };
  const httpSendMessage = {
    streamMessage: jest.fn(async function* (): AsyncGenerator<{
      event: string;
      data: unknown;
      meta?: unknown;
    }> {
      yield { event: 'delta', data: { text: 'Um laço. ' } };
      yield {
        event: 'done',
        data: { answer: 'Um laço.', quickReplies: [], topic: 'Laços' },
        meta: { provider: 'ollama', model: 'qwen2.5:7b' },
      };
    }),
    sendMessage: jest.fn().mockResolvedValue({
      reply: {
        answer: 'Um laço repete.',
        quickReplies: ['Ver exemplo'],
        topic: 'Laços',
        scenario: '',
      },
      meta: { provider: 'ollama', model: 'qwen2.5:7b' },
    }),
  };
  const tutorMetrics = { record: jest.fn().mockResolvedValue(undefined) };
  // Stored replies by clientMessageId, as the ChatReply table keeps them.
  const replies = new Map<string, { id: number; answer: string | null }>();
  const byId = (id: number) =>
    [...replies.entries()].find(([, row]) => row.id === id);
  const chatRepository = {
    getChatByReference: jest.fn().mockResolvedValue(chat),
    getConversations: jest.fn().mockResolvedValue([chat]),
    recordMessage: jest.fn().mockResolvedValue(undefined),
    reserveReply: jest.fn(async (_chatId: number, clientMessageId: string) => {
      const row = replies.get(clientMessageId);
      if (row) {
        return {
          existing: {
            ...row,
            quickReplies: ['Ver exemplo'],
            topic: 'Laços',
            createdAt: new Date(),
          },
        };
      }
      const id = replies.size + 1;
      replies.set(clientMessageId, { id, answer: null });
      return { reservationId: id };
    }),
    saveReply: jest.fn(async (id: number, reply: { answer: string }) => {
      byId(id)[1].answer = reply.answer;
    }),
    releaseReply: jest.fn(async (id: number) => {
      const entry = byId(id);
      if (entry && entry[1].answer === null) replies.delete(entry[0]);
    }),
  };
  const service = new ChatService(
    sessionModel as any,
    {} as any,
    httpSendMessage as any,
    chatRepository as any,
    tutorMetrics as any,
  );
  return {
    service,
    sessionModel,
    httpSendMessage,
    chatRepository,
    tutorMetrics,
  };
};

describe('ChatService', () => {
  it('sends to the tutor and records the message with its topic', async () => {
    const { service, httpSendMessage, chatRepository } = makeService();

    const reply = await service.sendMessage(
      1,
      chat.referenceId,
      'Oi',
      undefined,
      'concept',
    );

    expect(chatRepository.getChatByReference).toHaveBeenCalledWith(
      1,
      chat.referenceId,
    );
    expect(httpSendMessage.sendMessage).toHaveBeenCalledWith(
      1,
      chat.referenceId,
      'Oi',
      'concept',
    );
    expect(chatRepository.recordMessage).toHaveBeenCalledWith(chat, 'Laços');
    expect(reply.topic).toBe('Laços');
  });

  it("refuses to send to someone else's conversation", async () => {
    const { service, httpSendMessage, chatRepository } = makeService();
    chatRepository.getChatByReference.mockResolvedValue(null);

    await expect(
      service.sendMessage(2, chat.referenceId, 'Oi'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(httpSendMessage.sendMessage).not.toHaveBeenCalled();
  });

  it('lists conversations with an empty topic when there is none', async () => {
    const { service } = makeService();

    expect(await service.getConversations(1)).toEqual([
      {
        referenceId: chat.referenceId,
        topic: '',
        scenario: '',
        createdAt: chat.createdAt,
        lastMessageAt: chat.lastMessageAt,
      },
    ]);
  });

  it("lists each conversation with the tutor's scenario", async () => {
    const { service, sessionModel } = makeService();
    sessionModel.find.mockReturnValue({
      lean: () => ({
        exec: () =>
          Promise.resolve([{ id: chat.referenceId, scenario: 'fix_error' }]),
      }),
    });

    const [conversation] = await service.getConversations(1);

    expect(conversation.scenario).toBe('fix_error');
    expect(sessionModel.find).toHaveBeenCalledWith(
      { id: { $in: [chat.referenceId] } },
      { id: 1, scenario: 1 },
    );
  });

  it('returns the student and tutor messages, without system ones', async () => {
    const { service, sessionModel } = makeService({
      id: chat.referenceId,
      messages: [
        { role: 'system', content: 'regras', tooltip: null },
        { role: 'user', content: 'O que é um laço?', tooltip: null },
        {
          role: 'assistant',
          content: 'Um laço repete.',
          tooltip: ['a', 'b', 'c', 'd'],
        },
      ],
    });

    const messages = await service.getMessages(1, chat.referenceId);

    expect(sessionModel.findOne).toHaveBeenCalledWith({
      id: chat.referenceId,
    });
    expect(messages).toEqual([
      { role: 'user', content: 'O que é um laço?', quickReplies: [] },
      {
        role: 'assistant',
        content: 'Um laço repete.',
        quickReplies: ['a', 'b', 'c'],
      },
    ]);
  });

  it("does not read someone else's messages", async () => {
    const { service, sessionModel, chatRepository } = makeService();
    chatRepository.getChatByReference.mockResolvedValue(null);

    await expect(
      service.getMessages(2, chat.referenceId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(sessionModel.findOne).not.toHaveBeenCalled();
  });

  it('streams the reply and records the message once it is done', async () => {
    const { service, chatRepository } = makeService();

    const events = [];
    for await (const event of await service.streamMessage(
      1,
      chat.referenceId,
      'Oi',
    )) {
      events.push(event.event);
    }

    expect(events).toEqual(['delta', 'done']);
    expect(chatRepository.recordMessage).toHaveBeenCalledWith(chat, 'Laços');
  });

  it("refuses to stream someone else's conversation before it starts", async () => {
    const { service, httpSendMessage, chatRepository } = makeService();
    chatRepository.getChatByReference.mockResolvedValue(null);

    await expect(
      service.streamMessage(2, chat.referenceId, 'Oi'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(httpSendMessage.streamMessage).not.toHaveBeenCalled();
  });

  describe('tutor metrics', () => {
    const drain = async (events: AsyncGenerator<unknown>) => {
      const items = [];
      for await (const item of events) items.push(item);
      return items;
    };

    it('records an answered question with its length and model', async () => {
      const { service, tutorMetrics } = makeService();

      await service.sendMessage(1, chat.referenceId, 'Oi');

      expect(tutorMetrics.record).toHaveBeenCalledWith({
        chatId: chat.id,
        outcome: 'answered',
        latencyMs: expect.any(Number),
        replyChars: 'Um laço repete.'.length,
        provider: 'ollama',
        model: 'qwen2.5:7b',
        streamed: false,
      });
    });

    it('records why the tutor did not answer', async () => {
      const { service, httpSendMessage, tutorMetrics } = makeService();
      httpSendMessage.sendMessage.mockRejectedValueOnce(
        new TutorUnavailableException('timeout'),
      );

      await expect(
        service.sendMessage(1, chat.referenceId, 'Oi'),
      ).rejects.toBeInstanceOf(TutorUnavailableException);
      expect(tutorMetrics.record).toHaveBeenCalledWith(
        expect.objectContaining({ outcome: 'timeout', streamed: false }),
      );
    });

    it('still answers when the metric cannot be saved', async () => {
      const { service, tutorMetrics } = makeService();
      tutorMetrics.record.mockRejectedValueOnce(new Error('db down'));

      const reply = await service.sendMessage(1, chat.referenceId, 'Oi');

      expect(reply.answer).toBe('Um laço repete.');
    });

    it('records a streamed answer with the time to its first text', async () => {
      const { service, tutorMetrics } = makeService();

      const events = await drain(
        await service.streamMessage(1, chat.referenceId, 'Oi'),
      );

      expect(events[events.length - 1]).toEqual({
        event: 'done',
        data: { answer: 'Um laço.', quickReplies: [], topic: 'Laços' },
      });
      expect(tutorMetrics.record).toHaveBeenCalledWith({
        chatId: chat.id,
        outcome: 'answered',
        latencyMs: expect.any(Number),
        firstTextMs: expect.any(Number),
        replyChars: 'Um laço.'.length,
        provider: 'ollama',
        model: 'qwen2.5:7b',
        streamed: true,
      });
    });

    it('records the reason a stream ended with an error', async () => {
      const { service, httpSendMessage, tutorMetrics } = makeService();
      httpSendMessage.streamMessage.mockImplementationOnce(async function* () {
        yield {
          event: 'error',
          data: { message: 'fora do ar', reason: 'unreachable' },
        };
      });

      await drain(await service.streamMessage(1, chat.referenceId, 'Oi'));

      expect(tutorMetrics.record).toHaveBeenCalledWith(
        expect.objectContaining({ outcome: 'unreachable', replyChars: 0 }),
      );
    });

    it('records a student who left before the answer ended', async () => {
      const { service, tutorMetrics } = makeService();

      const events = await service.streamMessage(1, chat.referenceId, 'Oi');
      await events.next(); // the first delta
      await events.return(undefined);

      expect(tutorMetrics.record).toHaveBeenCalledWith(
        expect.objectContaining({ outcome: 'left', streamed: true }),
      );
    });
  });

  describe('with a clientMessageId', () => {
    const clientMessageId = '0f8d2a6e-3b7c-4d21-9f10-6a2b3c4d5e6f';

    it('asks the tutor once and returns the same reply when sent again', async () => {
      const { service, httpSendMessage } = makeService();

      const first = await service.sendMessage(
        1,
        chat.referenceId,
        'Oi',
        clientMessageId,
      );
      const second = await service.sendMessage(
        1,
        chat.referenceId,
        'Oi',
        clientMessageId,
      );

      expect(httpSendMessage.sendMessage).toHaveBeenCalledTimes(1);
      expect(second).toEqual(first);
    });

    it('answers a repeat that arrives while the first is pending with 409', async () => {
      const { service, chatRepository } = makeService();
      await chatRepository.reserveReply(chat.id, clientMessageId);

      await expect(
        service.sendMessage(1, chat.referenceId, 'Oi', clientMessageId),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('lets a retry ask again when the tutor failed', async () => {
      const { service, httpSendMessage } = makeService();
      httpSendMessage.sendMessage.mockRejectedValueOnce(new Error('down'));

      await expect(
        service.sendMessage(1, chat.referenceId, 'Oi', clientMessageId),
      ).rejects.toThrow('down');
      const reply = await service.sendMessage(
        1,
        chat.referenceId,
        'Oi',
        clientMessageId,
      );

      expect(httpSendMessage.sendMessage).toHaveBeenCalledTimes(2);
      expect(reply.answer).toBe('Um laço repete.');
    });

    it('streams a repeat as a single done event without asking the tutor', async () => {
      const { service, httpSendMessage } = makeService();
      const collect = async () => {
        const events = [];
        for await (const event of await service.streamMessage(
          1,
          chat.referenceId,
          'Oi',
          undefined,
          clientMessageId,
        )) {
          events.push(event);
        }
        return events;
      };

      await collect();
      const again = await collect();

      expect(httpSendMessage.streamMessage).toHaveBeenCalledTimes(1);
      expect(again).toEqual([
        {
          event: 'done',
          data: {
            answer: 'Um laço.',
            quickReplies: ['Ver exemplo'],
            topic: 'Laços',
            scenario: '',
          },
        },
      ]);
    });

    it('frees the id when the stream ends with an error', async () => {
      const { service, httpSendMessage, chatRepository } = makeService();
      httpSendMessage.streamMessage.mockImplementationOnce(async function* () {
        yield { event: 'error', data: { message: 'falhou' } };
      });

      const events = [];
      for await (const event of await service.streamMessage(
        1,
        chat.referenceId,
        'Oi',
        undefined,
        clientMessageId,
      )) {
        events.push(event.event);
      }

      expect(events).toEqual(['error']);

      expect(chatRepository.releaseReply).toHaveBeenCalledWith(1);
      expect(chatRepository.recordMessage).not.toHaveBeenCalled();
    });
  });
});

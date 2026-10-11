import { NotFoundException } from '@nestjs/common';
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
  };
  const httpSendMessage = {
    sendMessage: jest.fn().mockResolvedValue({
      answer: 'Um laço repete.',
      quickReplies: ['Ver exemplo'],
      topic: 'Laços',
    }),
  };
  const chatRepository = {
    getChatByReference: jest.fn().mockResolvedValue(chat),
    getConversations: jest.fn().mockResolvedValue([chat]),
    recordMessage: jest.fn().mockResolvedValue(undefined),
  };
  const service = new ChatService(
    sessionModel as any,
    {} as any,
    httpSendMessage as any,
    chatRepository as any,
  );
  return { service, sessionModel, httpSendMessage, chatRepository };
};

describe('ChatService', () => {
  it('sends to the tutor and records the message with its topic', async () => {
    const { service, httpSendMessage, chatRepository } = makeService();

    const reply = await service.sendMessage(1, chat.referenceId, 'Oi');

    expect(chatRepository.getChatByReference).toHaveBeenCalledWith(
      1,
      chat.referenceId,
    );
    expect(httpSendMessage.sendMessage).toHaveBeenCalledWith(
      1,
      chat.referenceId,
      'Oi',
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
        createdAt: chat.createdAt,
        lastMessageAt: chat.lastMessageAt,
      },
    ]);
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
});

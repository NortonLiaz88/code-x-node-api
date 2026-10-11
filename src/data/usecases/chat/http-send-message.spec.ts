import { RemoteSendMessage } from './http-send-mesage';

describe('RemoteSendMessage', () => {
  it('returns the typed reply built from the tutor answer', async () => {
    const remote = {
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

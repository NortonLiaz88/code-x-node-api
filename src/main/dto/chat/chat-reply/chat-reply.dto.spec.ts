import { ChatReplyDto } from './chat-reply.dto';

describe('ChatReplyDto.fromTutor', () => {
  it('maps the tutor tooltip to quick replies and keeps the topic', () => {
    expect(
      ChatReplyDto.fromTutor({
        answer: 'Um laço repete um bloco.',
        tooltip: ['Ver exemplo', 'Explicar de novo'],
        topic: ' Laços ',
      }),
    ).toEqual({
      answer: 'Um laço repete um bloco.',
      quickReplies: ['Ver exemplo', 'Explicar de novo'],
      topic: 'Laços',
    });
  });

  it('keeps at most three non-empty quick replies', () => {
    const reply = ChatReplyDto.fromTutor({
      answer: 'x',
      tooltip: ['a', ' ', 'b', 'c', 'd'],
    });

    expect(reply.quickReplies).toEqual(['a', 'b', 'c']);
  });

  it('always carries every field, empty when the tutor sent none', () => {
    expect(ChatReplyDto.fromTutor({ answer: 'x', tooltip: null })).toEqual({
      answer: 'x',
      quickReplies: [],
      topic: '',
    });
    expect(ChatReplyDto.fromTutor(undefined)).toEqual({
      answer: '',
      quickReplies: [],
      topic: '',
    });
  });
});

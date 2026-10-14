import { ChatReplyDto } from './chat-reply.dto';

describe('ChatReplyDto.fromTutor', () => {
  it('maps the tutor tooltip to quick replies and keeps the topic', () => {
    expect(
      ChatReplyDto.fromTutor({
        answer: 'Um laço repete um bloco.',
        tooltip: ['Ver exemplo', 'Explicar de novo'],
        topic: ' Laços ',
        scenario: 'concept',
      }),
    ).toEqual({
      answer: 'Um laço repete um bloco.',
      quickReplies: ['Ver exemplo', 'Explicar de novo'],
      topic: 'Laços',
      scenario: 'concept',
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
      scenario: '',
    });
    expect(ChatReplyDto.fromTutor(undefined)).toEqual({
      answer: '',
      quickReplies: [],
      topic: '',
      scenario: '',
    });
  });

  it('drops a scenario the API does not know', () => {
    expect(
      ChatReplyDto.fromTutor({ answer: 'x', scenario: 'debate' }).scenario,
    ).toBe('');
  });
});

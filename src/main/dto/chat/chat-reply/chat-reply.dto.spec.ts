import { ChatReplyDto } from './chat-reply.dto';

describe('ChatReplyDto.fromTutor', () => {
  it('maps the tutor tooltip to quick replies and keeps the topic', () => {
    expect(
      ChatReplyDto.fromTutor({
        answer: 'Um laço repete um bloco.',
        tooltip: ['Ver exemplo', 'Explicar de novo'],
        topic: ' Laços ',
        scenario: 'concept',
        subject: 'data_structures',
        suggested_subject: 'recursion_dp',
      }),
    ).toEqual({
      answer: 'Um laço repete um bloco.',
      quickReplies: ['Ver exemplo', 'Explicar de novo'],
      topic: 'Laços',
      scenario: 'concept',
      subject: 'data_structures',
      suggestedSubject: 'recursion_dp',
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
      subject: '',
      suggestedSubject: '',
    });
    expect(ChatReplyDto.fromTutor(undefined)).toEqual({
      answer: '',
      quickReplies: [],
      topic: '',
      scenario: '',
      subject: '',
      suggestedSubject: '',
    });
  });

  it('drops a scenario or subject the API does not know', () => {
    const reply = ChatReplyDto.fromTutor({
      answer: 'x',
      scenario: 'debate',
      subject: 'física',
      suggested_subject: 'física',
    });
    expect([reply.scenario, reply.subject, reply.suggestedSubject]).toEqual([
      '',
      '',
      '',
    ]);
  });
});

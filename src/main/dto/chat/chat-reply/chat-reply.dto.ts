import { ApiProperty } from '@nestjs/swagger';
import { TutorFailure } from 'src/data/protocols/db/chat/db-send-message-repository';

export const MAX_QUICK_REPLIES = 3;

/**
 * The learning scenarios the tutor is built around (code-x-ai
 * src/infra/llm/scenarios.py). The app sends the student's pick; without
 * one the tutor reads it from the message.
 */
export const TUTOR_SCENARIOS = [
  'concept',
  'read_code',
  'fix_error',
  'plan',
  'practice',
  'general',
] as const;
export type TutorScenario = (typeof TUTOR_SCENARIOS)[number];

export const asScenario = (value: unknown): TutorScenario | '' =>
  TUTOR_SCENARIOS.includes(value as TutorScenario)
    ? (value as TutorScenario)
    : '';

/**
 * The tutor's subject agents (code-x-ai src/infra/llm/subjects.py). Each one
 * teaches only its subject; `fundamentals` is the default.
 */
export const TUTOR_SUBJECTS = [
  'fundamentals',
  'data_structures',
  'algorithms',
  'recursion_dp',
] as const;
export type TutorSubject = (typeof TUTOR_SUBJECTS)[number];

export const asSubject = (value: unknown): TutorSubject | '' =>
  TUTOR_SUBJECTS.includes(value as TutorSubject) ? (value as TutorSubject) : '';

/** What the student picked for the conversation, passed on to the tutor. */
export interface TutorPick {
  scenario?: TutorScenario;
  subject?: TutorSubject;
}

/** Reply as the tutor service (code-x-ai) sends it. */
export interface TutorReply {
  answer?: string;
  tooltip?: string[] | null;
  topic?: string | null;
  scenario?: string | null;
  subject?: string | null;
  suggested_subject?: string | null;
  provider?: string | null;
  model?: string | null;
}

/** Which provider and model answered, kept for the tutor metrics only. */
export interface TutorMeta {
  provider: string | null;
  model: string | null;
}

export const tutorMeta = (reply: TutorReply | undefined): TutorMeta => ({
  provider: reply?.provider || null,
  model: reply?.model || null,
});

/** What the app receives on POST /chat/send-message/stream. */
export type ChatStreamEvent =
  | { event: 'delta'; data: { text: string } }
  | { event: 'done'; data: ChatReplyDto; meta?: TutorMeta }
  | { event: 'error'; data: { message: string; reason?: TutorFailure } };

export const STREAM_ERROR_MESSAGE =
  'Não consegui gerar uma resposta agora. Tente de novo.';

export class ChatReplyDto {
  @ApiProperty({ description: "The tutor's answer" })
  answer: string;

  @ApiProperty({
    type: [String],
    maxItems: MAX_QUICK_REPLIES,
    description: 'Short replies the student can tap, empty when there are none',
    example: ['Ver um exemplo', 'Explicar de novo'],
  })
  quickReplies: string[];

  @ApiProperty({
    description: 'What the conversation is about, empty when unknown',
    example: 'Laços',
  })
  topic: string;

  @ApiProperty({
    enum: [...TUTOR_SCENARIOS, ''],
    description:
      'The learning scenario the tutor answered in, empty when unknown (for example a repeated clientMessageId)',
    example: 'fix_error',
  })
  scenario: TutorScenario | '';

  @ApiProperty({
    enum: [...TUTOR_SUBJECTS, ''],
    description:
      'The subject agent of the conversation, empty when unknown (for example before the tutor has read one)',
    example: 'data_structures',
  })
  subject: TutorSubject | '';

  @ApiProperty({
    enum: [...TUTOR_SUBJECTS, ''],
    description:
      'Set when the question belongs to another agent: the answer only points there, and the app can offer a new chat with it. Empty otherwise',
    example: '',
  })
  suggestedSubject: TutorSubject | '';

  static fromTutor(reply: TutorReply | undefined): ChatReplyDto {
    const quickReplies = (reply?.tooltip ?? [])
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_QUICK_REPLIES);

    return {
      answer: reply?.answer ?? '',
      quickReplies,
      topic: reply?.topic?.trim() ?? '',
      scenario: asScenario(reply?.scenario),
      subject: asSubject(reply?.subject),
      suggestedSubject: asSubject(reply?.suggested_subject),
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { TutorFailure } from 'src/data/protocols/db/chat/db-send-message-repository';

export const MAX_QUICK_REPLIES = 3;

/** Reply as the tutor service (code-x-ai) sends it. */
export interface TutorReply {
  answer?: string;
  tooltip?: string[] | null;
  topic?: string | null;
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
    };
  }
}

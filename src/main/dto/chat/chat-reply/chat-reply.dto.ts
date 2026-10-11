import { ApiProperty } from '@nestjs/swagger';

export const MAX_QUICK_REPLIES = 3;

/** Reply as the tutor service (code-x-ai) sends it. */
export interface TutorReply {
  answer?: string;
  tooltip?: string[] | null;
  topic?: string | null;
}

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

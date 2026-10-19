import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import {
  TUTOR_SCENARIOS,
  TUTOR_SUBJECTS,
  TutorScenario,
  TutorSubject,
} from 'src/main/dto/chat/chat-reply/chat-reply.dto';

export class ChatReferenceParam {
  @IsUUID()
  @ApiProperty()
  referenceId: string;
}

export class ChatConversationDto {
  @ApiProperty({ description: 'Pass it to send-message to continue' })
  referenceId: string;

  @ApiProperty({
    description: 'What the conversation is about, empty when unknown',
    example: 'Laços',
  })
  topic: string;

  @ApiProperty({
    enum: [...TUTOR_SCENARIOS, ''],
    description:
      'The learning scenario of the conversation, empty when unknown',
  })
  scenario: TutorScenario | '';

  @ApiProperty({
    enum: [...TUTOR_SUBJECTS, ''],
    description: 'The subject agent of the conversation, empty when unknown',
  })
  subject: TutorSubject | '';

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastMessageAt: Date;
}

export class ChatHistoryMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @ApiProperty()
  content: string;

  @ApiProperty({
    type: [String],
    description: "The tutor's quick replies, empty for the student's messages",
  })
  quickReplies: string[];
}

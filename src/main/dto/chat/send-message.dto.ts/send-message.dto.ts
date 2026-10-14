import { IsUUID, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  TUTOR_SCENARIOS,
  TUTOR_SUBJECTS,
  TutorScenario,
  TutorSubject,
} from 'src/main/dto/chat/chat-reply/chat-reply.dto';

export class SendMessageDto {
  @IsUUID()
  @ApiProperty()
  referenceId: string;

  @IsString()
  @ApiProperty()
  message: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    required: false,
    description:
      'Id the app gives the question. Sending the same id again returns the stored answer instead of asking the tutor twice.',
  })
  clientMessageId?: string;

  @IsOptional()
  @IsIn(TUTOR_SCENARIOS)
  @ApiProperty({
    required: false,
    enum: TUTOR_SCENARIOS,
    description:
      'The scenario the student picked. Without it the tutor reads it from the message; a different pick restarts its hint ladder.',
  })
  scenario?: TutorScenario;

  @IsOptional()
  @IsIn(TUTOR_SUBJECTS)
  @ApiProperty({
    required: false,
    enum: TUTOR_SUBJECTS,
    description:
      'The subject agent the student picked. Without it the tutor reads it from the first messages; once set, it stays for the conversation.',
  })
  subject?: TutorSubject;
}

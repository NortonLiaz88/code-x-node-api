import { ServiceUnavailableException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { TutorFailure } from 'src/data/protocols/db/chat/db-send-message-repository';

export const TUTOR_UNAVAILABLE = 'TUTOR_UNAVAILABLE';

/** What the student reads when the tutor can't answer. */
export const TUTOR_UNAVAILABLE_MESSAGES: Record<TutorFailure, string> = {
  unreachable:
    'O tutor está fora do ar agora. Tente de novo em alguns minutos.',
  timeout:
    'O tutor demorou demais para responder. Tente de novo em alguns minutos.',
  failed:
    'O tutor não conseguiu responder agora. Tente de novo em alguns minutos.',
};

export class TutorUnavailableDto {
  @ApiProperty({ example: 503 })
  statusCode: number;

  @ApiProperty({ example: TUTOR_UNAVAILABLE })
  error: string;

  @ApiProperty({ enum: ['unreachable', 'timeout', 'failed'] })
  reason: TutorFailure;

  @ApiProperty({ example: TUTOR_UNAVAILABLE_MESSAGES.unreachable })
  message: string;
}

export class TutorUnavailableException extends ServiceUnavailableException {
  constructor(reason: TutorFailure) {
    const body: TutorUnavailableDto = {
      statusCode: 503,
      error: TUTOR_UNAVAILABLE,
      reason,
      message: TUTOR_UNAVAILABLE_MESSAGES[reason],
    };
    super(body);
  }
}

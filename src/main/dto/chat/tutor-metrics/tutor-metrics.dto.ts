import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class TutorMetricsQuery {
  @ApiPropertyOptional({
    description: 'The day to report, in UTC (default today)',
    example: '2026-10-12',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date?: string;
}

export class LatencyDto {
  @ApiProperty({ nullable: true, description: 'ms; null with no answers' })
  median: number | null;

  @ApiProperty({ nullable: true, description: 'ms; null with no answers' })
  p95: number | null;
}

export class ModelMetricsDto {
  @ApiProperty({ nullable: true, example: 'ollama' })
  provider: string | null;

  @ApiProperty({ nullable: true, example: 'qwen2.5:7b' })
  model: string | null;

  @ApiProperty()
  answers: number;

  @ApiProperty({ type: LatencyDto })
  latencyMs: LatencyDto;

  @ApiProperty({
    nullable: true,
    description: 'Median answer length, characters',
  })
  medianReplyChars: number | null;
}

export class TutorMetricsDto {
  @ApiProperty({ example: '2026-10-12' })
  date: string;

  @ApiProperty({ description: 'Questions sent to the tutor' })
  questions: number;

  @ApiProperty({ description: 'Questions the tutor answered in full' })
  answers: number;

  @ApiProperty({
    description:
      'Questions without an answer: tutor unreachable, too slow, failed, or the student closed a streamed answer before it ended',
    example: { unreachable: 0, timeout: 1, failed: 0, left: 2 },
  })
  unanswered: Record<'unreachable' | 'timeout' | 'failed' | 'left', number>;

  @ApiProperty({ type: LatencyDto, description: 'Until the whole answer' })
  latencyMs: LatencyDto;

  @ApiProperty({
    type: LatencyDto,
    description: 'Streamed answers: until the first text showed',
  })
  firstTextMs: LatencyDto;

  @ApiProperty({
    nullable: true,
    description: 'Median answer length, characters',
  })
  medianReplyChars: number | null;

  @ApiProperty({ description: 'Conversations started that day' })
  conversations: number;

  @ApiProperty({
    description:
      "Conversations started that day where the student never replied to the tutor's first answer",
  })
  abandoned: number;

  @ApiProperty({
    nullable: true,
    description: 'abandoned / conversations that got an answer, 0 to 1',
  })
  abandonmentRate: number | null;

  @ApiProperty({ type: [ModelMetricsDto] })
  byModel: ModelMetricsDto[];
}

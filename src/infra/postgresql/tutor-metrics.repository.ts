import { PrismaClientService } from '../orm/prisma/prisma-client.service';

export type TutorOutcome =
  | 'answered'
  | 'unreachable'
  | 'timeout'
  | 'failed'
  | 'left';

export interface TutorMetricInput {
  chatId: number;
  outcome: TutorOutcome;
  latencyMs: number;
  firstTextMs?: number | null;
  replyChars?: number;
  provider?: string | null;
  model?: string | null;
  streamed: boolean;
}

export interface TutorMetricRow {
  chatId: number;
  outcome: string;
  latencyMs: number;
  firstTextMs: number | null;
  replyChars: number;
  provider: string | null;
  model: string | null;
  streamed: boolean;
}

/** A conversation started in the period, with every question asked in it. */
export interface NewConversation {
  id: number;
  outcomes: string[];
}

export class TutorMetricsRepository {
  constructor(private readonly ormService: PrismaClientService) {}

  async record(metric: TutorMetricInput): Promise<void> {
    await this.ormService.tutorMetric.create({ data: metric });
  }

  async metricsBetween(from: Date, to: Date): Promise<TutorMetricRow[]> {
    return this.ormService.tutorMetric.findMany({
      where: { createdAt: { gte: from, lt: to } },
      select: {
        chatId: true,
        outcome: true,
        latencyMs: true,
        firstTextMs: true,
        replyChars: true,
        provider: true,
        model: true,
        streamed: true,
      },
    });
  }

  async conversationsStartedBetween(
    from: Date,
    to: Date,
  ): Promise<NewConversation[]> {
    const chats = await this.ormService.chat.findMany({
      where: { createdAt: { gte: from, lt: to } },
      select: {
        id: true,
        tutorMetrics: { select: { outcome: true }, orderBy: { id: 'asc' } },
      },
    });
    return chats.map((chat) => ({
      id: chat.id,
      outcomes: chat.tutorMetrics.map((metric) => metric.outcome),
    }));
  }
}

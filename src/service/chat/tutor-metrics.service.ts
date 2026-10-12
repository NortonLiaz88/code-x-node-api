import { Injectable } from '@nestjs/common';
import { TutorMetricsRepository } from 'src/infra/postgresql/tutor-metrics.repository';
import { TutorMetricsDto } from 'src/main/dto/chat/tutor-metrics/tutor-metrics.dto';
import { summarizeDay } from './tutor-metrics';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class TutorMetricsService {
  constructor(private readonly repository: TutorMetricsRepository) {}

  /** The given UTC day (YYYY-MM-DD), or today. */
  async daily(date?: string): Promise<TutorMetricsDto> {
    const day = date ?? new Date().toISOString().slice(0, 10);
    const from = new Date(`${day}T00:00:00.000Z`);
    const to = new Date(from.getTime() + DAY_MS);
    const [metrics, conversations] = await Promise.all([
      this.repository.metricsBetween(from, to),
      this.repository.conversationsStartedBetween(from, to),
    ]);
    return summarizeDay(day, metrics, conversations);
  }
}

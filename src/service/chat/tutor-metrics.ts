import {
  NewConversation,
  TutorMetricRow,
} from 'src/infra/postgresql/tutor-metrics.repository';
import {
  LatencyDto,
  ModelMetricsDto,
  TutorMetricsDto,
} from 'src/main/dto/chat/tutor-metrics/tutor-metrics.dto';

export const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
};

/** Nearest-rank percentile: the smallest value at or above p% of them. */
export const percentile = (values: number[], p: number): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)];
};

const latency = (values: number[]): LatencyDto => ({
  median: median(values),
  p95: percentile(values, 95),
});

const byModel = (answered: TutorMetricRow[]): ModelMetricsDto[] => {
  const groups = new Map<string, TutorMetricRow[]>();
  for (const row of answered) {
    const key = `${row.provider ?? ''}\u0000${row.model ?? ''}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.values()]
    .map((rows) => ({
      provider: rows[0].provider,
      model: rows[0].model,
      answers: rows.length,
      latencyMs: latency(rows.map((row) => row.latencyMs)),
      medianReplyChars: median(rows.map((row) => row.replyChars)),
    }))
    .sort((a, b) => b.answers - a.answers);
};

/**
 * One day of tutor use. A conversation counts as abandoned when the tutor
 * answered its first question and the student never asked anything else.
 */
export const summarizeDay = (
  date: string,
  metrics: TutorMetricRow[],
  conversations: NewConversation[],
): TutorMetricsDto => {
  const answered = metrics.filter((row) => row.outcome === 'answered');
  const count = (outcome: string) =>
    metrics.filter((row) => row.outcome === outcome).length;

  const gotAnswer = conversations.filter((chat) =>
    chat.outcomes.includes('answered'),
  );
  const abandoned = gotAnswer.filter(
    (chat) => chat.outcomes.length === 1,
  ).length;

  return {
    date,
    questions: metrics.length,
    answers: answered.length,
    unanswered: {
      unreachable: count('unreachable'),
      timeout: count('timeout'),
      failed: count('failed'),
      left: count('left'),
    },
    latencyMs: latency(answered.map((row) => row.latencyMs)),
    firstTextMs: latency(
      answered
        .filter((row) => row.streamed && row.firstTextMs !== null)
        .map((row) => row.firstTextMs),
    ),
    medianReplyChars: median(answered.map((row) => row.replyChars)),
    conversations: conversations.length,
    abandoned,
    abandonmentRate: gotAnswer.length
      ? Math.round((abandoned / gotAnswer.length) * 1000) / 1000
      : null,
    byModel: byModel(answered),
  };
};

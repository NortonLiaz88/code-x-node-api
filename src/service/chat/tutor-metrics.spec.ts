import { TutorMetricRow } from 'src/infra/postgresql/tutor-metrics.repository';
import { median, percentile, summarizeDay } from './tutor-metrics';

const row = (overrides: Partial<TutorMetricRow>): TutorMetricRow => ({
  chatId: 1,
  outcome: 'answered',
  latencyMs: 1000,
  firstTextMs: null,
  replyChars: 100,
  provider: 'ollama',
  model: 'qwen2.5:7b',
  streamed: false,
  ...overrides,
});

describe('tutor metrics', () => {
  it('takes medians and nearest-rank percentiles', () => {
    expect(median([])).toBeNull();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(3); // 2.5 rounded
    const hundred = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(percentile(hundred, 95)).toBe(95);
    expect(percentile([7], 95)).toBe(7);
  });

  it('summarizes a day of questions', () => {
    const summary = summarizeDay(
      '2026-10-12',
      [
        row({ chatId: 1, latencyMs: 2000, replyChars: 200 }),
        row({
          chatId: 1,
          latencyMs: 4000,
          replyChars: 400,
          streamed: true,
          firstTextMs: 900,
        }),
        row({
          chatId: 2,
          latencyMs: 9000,
          replyChars: 50,
          provider: 'groq',
          model: 'llama',
        }),
        row({
          chatId: 3,
          outcome: 'timeout',
          latencyMs: 120000,
          replyChars: 0,
        }),
        row({ chatId: 3, outcome: 'left', latencyMs: 5000, replyChars: 0 }),
      ],
      [
        { id: 1, outcomes: ['answered', 'answered'] }, // replied: kept going
        { id: 2, outcomes: ['answered'] }, // never replied: abandoned
        { id: 3, outcomes: ['timeout', 'left'] }, // never got an answer
      ],
    );

    expect(summary).toEqual({
      date: '2026-10-12',
      questions: 5,
      answers: 3,
      unanswered: { unreachable: 0, timeout: 1, failed: 0, left: 1 },
      latencyMs: { median: 4000, p95: 9000 },
      firstTextMs: { median: 900, p95: 900 },
      medianReplyChars: 200,
      conversations: 3,
      abandoned: 1,
      abandonmentRate: 0.5,
      byModel: [
        {
          provider: 'ollama',
          model: 'qwen2.5:7b',
          answers: 2,
          latencyMs: { median: 3000, p95: 4000 },
          medianReplyChars: 300,
        },
        {
          provider: 'groq',
          model: 'llama',
          answers: 1,
          latencyMs: { median: 9000, p95: 9000 },
          medianReplyChars: 50,
        },
      ],
    });
  });

  it('reports an empty day without dividing by zero', () => {
    const summary = summarizeDay('2026-10-12', [], []);

    expect(summary.latencyMs).toEqual({ median: null, p95: null });
    expect(summary.abandonmentRate).toBeNull();
    expect(summary.byModel).toEqual([]);
  });
});

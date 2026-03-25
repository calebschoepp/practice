import { describe, expect, test } from "bun:test";
import { calculateDailyStreak, calculateSummary, calculateWeeklyStreak } from "@/domain/stats";
import type { Completion, Session } from "@/domain/types";

const completions: Completion[] = [
  {
    id: "c1",
    sessionId: "s1",
    exerciseId: "e1",
    variationId: "v1",
    startedAt: "2026-01-01T10:00:00.000Z",
    endedAt: "2026-01-01T10:05:00.000Z",
    tempo: 100,
    difficulty: 3,
  },
  {
    id: "c2",
    sessionId: "s2",
    exerciseId: "e1",
    variationId: "v1",
    startedAt: "2026-01-02T10:00:00.000Z",
    endedAt: "2026-01-02T10:05:00.000Z",
    tempo: 104,
    difficulty: 4,
  },
  {
    id: "c3",
    sessionId: "s3",
    exerciseId: "e2",
    variationId: "v2",
    startedAt: "2026-01-08T10:00:00.000Z",
    endedAt: "2026-01-08T10:05:00.000Z",
    tempo: 96,
    difficulty: 2,
  },
];

describe("stats calculations", () => {
  test("calculates daily streak from latest consecutive dates", () => {
    expect(calculateDailyStreak(completions)).toBe(1);
  });

  test("calculates weekly streak from latest consecutive weeks", () => {
    expect(calculateWeeklyStreak(completions)).toBe(2);
  });

  test("aggregates summary metrics", () => {
    const sessions: Session[] = [
      {
        id: "s1",
        instrument: "piano",
        length: "short",
        startedAt: "2026-01-01T10:00:00.000Z",
        endedAt: "2026-01-01T10:10:00.000Z",
      },
      {
        id: "s2",
        instrument: "guitar",
        length: "long",
        startedAt: "2026-01-02T10:00:00.000Z",
        endedAt: "2026-01-02T10:20:00.000Z",
      },
    ];

    const summary = calculateSummary(sessions, completions);
    expect(summary.totalSessions).toBe(2);
    expect(summary.totalPracticeMinutes).toBe(30);
    expect(summary.averageSessionMinutes).toBe(15);
  });
});

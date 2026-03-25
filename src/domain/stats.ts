import type { Completion, Session, StatsSummary } from "@/domain/types";

const MS_IN_MINUTE = 60_000;
const MS_IN_DAY = 86_400_000;

function toDayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function getWeekKey(iso: string): string {
  const date = new Date(iso);
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / MS_IN_DAY + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function calculateDailyStreak(completions: Completion[]): number {
  if (completions.length === 0) return 0;
  const dayKeys = [...new Set(completions.map((c) => toDayKey(c.endedAt)))].sort();
  let streak = 1;
  for (let i = dayKeys.length - 1; i > 0; i--) {
    const current = new Date(`${dayKeys[i]}T00:00:00.000Z`).getTime();
    const previous = new Date(`${dayKeys[i - 1]}T00:00:00.000Z`).getTime();
    if (current - previous === MS_IN_DAY) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export function calculateWeeklyStreak(completions: Completion[]): number {
  if (completions.length === 0) return 0;
  const weekKeys = [...new Set(completions.map((c) => getWeekKey(c.endedAt)))].sort();
  let streak = 1;
  for (let i = weekKeys.length - 1; i > 0; i--) {
    const [yearA = 0, weekA = 0] = weekKeys[i]!.split("-W").map(Number);
    const [yearB = 0, weekB = 0] = weekKeys[i - 1]!.split("-W").map(Number);
    const a = yearA * 53 + weekA;
    const b = yearB * 53 + weekB;
    if (a - b === 1) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export function calculateSummary(sessions: Session[], completions: Completion[]): StatsSummary {
  const endedSessions = sessions.filter((session) => session.endedAt);
  const totalPracticeMinutes = endedSessions.reduce((acc, session) => {
    if (!session.endedAt) return acc;
    const duration = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
    return acc + duration / MS_IN_MINUTE;
  }, 0);

  const averageSessionMinutes =
    endedSessions.length === 0 ? 0 : totalPracticeMinutes / endedSessions.length;

  return {
    totalSessions: sessions.length,
    totalPracticeMinutes: Number(totalPracticeMinutes.toFixed(1)),
    averageSessionMinutes: Number(averageSessionMinutes.toFixed(1)),
    dailyStreak: calculateDailyStreak(completions),
    weeklyStreak: calculateWeeklyStreak(completions),
  };
}

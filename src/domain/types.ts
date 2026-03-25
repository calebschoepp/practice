export type Instrument = "piano" | "guitar";

export type PracticeLength = "short" | "long" | "unlimited";

export interface Exercise {
  id: string;
  instrument: Instrument;
  name: string;
  defaultTempo: number;
  fingering: string[];
}

export interface Variation {
  id: string;
  name: string;
  description: string;
}

export interface Session {
  id: string;
  instrument: Instrument;
  length: PracticeLength;
  startedAt: string;
  endedAt?: string;
}

export interface Completion {
  id: string;
  sessionId: string;
  exerciseId: string;
  variationId: string;
  startedAt: string;
  endedAt: string;
  tempo: number;
  difficulty: 0 | 1 | 2 | 3 | 4;
}

export interface SessionQueueItem {
  exercise: Exercise;
  variation: Variation;
}

export interface StatsSummary {
  totalSessions: number;
  totalPracticeMinutes: number;
  averageSessionMinutes: number;
  dailyStreak: number;
  weeklyStreak: number;
}

export interface ExerciseProgressPoint {
  completionId: string;
  exerciseId: string;
  endedAt: string;
  tempo: number;
  difficulty: number;
}

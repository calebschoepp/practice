import type {
  Completion,
  Exercise,
  ExerciseProgressPoint,
  Instrument,
  PracticeLength,
  Session,
  StatsSummary,
  Variation,
} from "@/domain/types";

export interface CatalogSeedInput {
  version: number;
  exercises: Exercise[];
  variations: Variation[];
}

export interface SessionInput {
  instrument: Instrument;
  length: PracticeLength;
  startedAt: string;
}

export interface CompletionInput {
  sessionId: string;
  exerciseId: string;
  variationId: string;
  startedAt: string;
  endedAt: string;
  tempo: number;
  difficulty: 0 | 1 | 2 | 3 | 4;
}

export interface StorageAdapter {
  initialize(): Promise<void>;
  seedIfNeeded(seed: CatalogSeedInput): Promise<void>;

  listExercises(instrument?: Instrument): Promise<Exercise[]>;
  listVariations(): Promise<Variation[]>;

  createSession(input: SessionInput): Promise<Session>;
  getSession(id: string): Promise<Session | null>;
  listSessions(): Promise<Session[]>;
  endSession(id: string, endedAt: string): Promise<void>;

  createCompletion(input: CompletionInput): Promise<Completion>;
  listCompletionsBySession(sessionId: string): Promise<Completion[]>;
  listCompletionsByExercise(exerciseId: string): Promise<Completion[]>;
  listExerciseProgress(exerciseId: string): Promise<ExerciseProgressPoint[]>;

  getStatsSummary(): Promise<StatsSummary>;
}

export type Instrument = "piano" | "guitar";

export type PracticeLength = "short" | "long" | "unlimited";

export type NoteName = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

export interface PianoKeyFingering {
  note: NoteName;
  octave: number;
  finger: number;
}

export interface PianoHand {
  hand: "RH" | "LH";
  keys: PianoKeyFingering[];
}

export interface PianoFingering {
  type: "piano";
  hands: PianoHand[];
}

export interface GuitarPosition {
  string: number;
  fret: number;
  finger?: number;
}

export interface GuitarFingering {
  type: "guitar";
  positions: GuitarPosition[];
  startFret?: number;
}

export type Fingering = PianoFingering | GuitarFingering;

export interface Exercise {
  id: string;
  instrument: Instrument;
  name: string;
  defaultTempo: number;
  fingering: Fingering;
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

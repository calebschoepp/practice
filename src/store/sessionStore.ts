import { create } from "zustand";
import {
  createNextQueueItem,
  createPracticeQueue,
  getSessionExerciseTarget,
} from "@/domain/session";
import type { Instrument, PracticeLength, SessionQueueItem } from "@/domain/types";
import { ensureStorageBootstrapped, storageAdapter } from "@/storage";

interface SessionState {
  isReady: boolean;
  isBusy: boolean;
  sessionId: string | null;
  instrument: Instrument;
  length: PracticeLength;
  muted: boolean;
  tempo: number;
  queue: SessionQueueItem[];
  queueIndex: number;
  exerciseStartedAt: string | null;
  completedCount: number;
  targetCount: number | null;

  bootstrap: () => Promise<void>;
  setInstrument: (instrument: Instrument) => void;
  setLength: (length: PracticeLength) => void;
  adjustTempo: (delta: number) => void;
  toggleMuted: () => void;
  startSession: () => Promise<void>;
  submitDifficulty: (difficulty: 0 | 1 | 2 | 3 | 4) => Promise<{ ended: boolean }>;
  endSessionEarly: () => Promise<void>;
}

const clampTempo = (value: number) => Math.min(260, Math.max(30, value));

const initialState = {
  isReady: false,
  isBusy: false,
  sessionId: null,
  instrument: "piano" as Instrument,
  length: "short" as PracticeLength,
  muted: false,
  tempo: 80,
  queue: [] as SessionQueueItem[],
  queueIndex: 0,
  exerciseStartedAt: null as string | null,
  completedCount: 0,
  targetCount: 3 as number | null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,

  bootstrap: async () => {
    await ensureStorageBootstrapped();
    set({ isReady: true });
  },

  setInstrument: (instrument) => set({ instrument }),
  setLength: (length) => set({ length, targetCount: getSessionExerciseTarget(length) }),
  adjustTempo: (delta) => set((state) => ({ tempo: clampTempo(state.tempo + delta) })),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),

  startSession: async () => {
    const { instrument, length } = get();
    set({ isBusy: true });
    await ensureStorageBootstrapped();

    const [exercises, variations, disabledIds] = await Promise.all([
      storageAdapter.listExercises(instrument),
      storageAdapter.listVariations(),
      storageAdapter.getDisabledExerciseIds(),
    ]);

    const enabledExercises = exercises.filter((e) => !disabledIds.has(e.id));
    const queue = createPracticeQueue(enabledExercises, variations, length);
    if (queue.length === 0) {
      set({ isBusy: false });
      return;
    }

    const now = new Date().toISOString();
    const session = await storageAdapter.createSession({
      instrument,
      length,
      startedAt: now,
    });

    set({
      isBusy: false,
      sessionId: session.id,
      queue,
      queueIndex: 0,
      tempo: queue[0]!.exercise.defaultTempo,
      exerciseStartedAt: now,
      completedCount: 0,
      targetCount: getSessionExerciseTarget(length),
    });
  },

  submitDifficulty: async (difficulty) => {
    const state = get();
    const current = state.queue[state.queueIndex];
    if (!state.sessionId || !current || !state.exerciseStartedAt) {
      return { ended: false };
    }

    const endedAt = new Date().toISOString();
    await storageAdapter.createCompletion({
      sessionId: state.sessionId,
      exerciseId: current.exercise.id,
      variationId: current.variation.id,
      startedAt: state.exerciseStartedAt,
      endedAt,
      tempo: state.tempo,
      difficulty,
    });

    const nextCompletedCount = state.completedCount + 1;
    if (state.targetCount !== null && nextCompletedCount >= state.targetCount) {
      await storageAdapter.endSession(state.sessionId, endedAt);
      set({
        ...initialState,
        isReady: state.isReady,
        instrument: state.instrument,
        length: state.length,
        targetCount: getSessionExerciseTarget(state.length),
        muted: state.muted,
      });
      return { ended: true };
    }

    let nextQueue = state.queue;
    let nextIndex = state.queueIndex + 1;

    if (state.targetCount === null) {
      const [exercises, disabledIds] = await Promise.all([
        storageAdapter.listExercises(state.instrument),
        storageAdapter.getDisabledExerciseIds(),
      ]);
      const variations = await storageAdapter.listVariations();
      const enabledExercises = exercises.filter((e) => !disabledIds.has(e.id));
      const previousExerciseId = state.queue[state.queueIndex]?.exercise.id;
      const nextItem = createNextQueueItem(enabledExercises, variations, previousExerciseId);
      nextQueue = [...state.queue, nextItem];
      nextIndex = state.queueIndex + 1;
    }

    const next = nextQueue[nextIndex];
    set({
      queue: nextQueue,
      queueIndex: nextIndex,
      completedCount: nextCompletedCount,
      exerciseStartedAt: endedAt,
      tempo: next?.exercise.defaultTempo ?? state.tempo,
    });

    return { ended: false };
  },

  endSessionEarly: async () => {
    const state = get();
    if (state.sessionId) {
      await storageAdapter.endSession(state.sessionId, new Date().toISOString());
    }
    set({
      ...initialState,
      isReady: state.isReady,
      instrument: state.instrument,
      length: state.length,
      targetCount: getSessionExerciseTarget(state.length),
      muted: state.muted,
    });
  },
}));

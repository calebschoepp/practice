import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PracticeUnit {
  id: string;
  name: string;
  targetTempo: number;
  lastTempo: number;
}

interface PracticeState {
  counts: Record<string, number>;
  practiceUnits: Record<string, PracticeUnit[]>; // keyed by instrument
  incrementCount: (instrument: string) => void;
  getCount: (instrument: string) => number;
  getPracticeUnits: (instrument: string) => PracticeUnit[];
  addPracticeUnit: (instrument: string, unit: Omit<PracticeUnit, "id">) => void;
  updatePracticeUnit: (instrument: string, unitId: string, updates: Partial<Omit<PracticeUnit, "id">>) => void;
  deletePracticeUnit: (instrument: string, unitId: string) => void;
  updateLastTempo: (instrument: string, unitId: string, newTempo: number) => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      counts: {},
      practiceUnits: {},
      incrementCount: (instrument: string) =>
        set((state) => ({
          counts: {
            ...state.counts,
            [instrument]: (state.counts[instrument] || 0) + 1,
          },
        })),
      getCount: (instrument: string) => get().counts[instrument] || 0,
      getPracticeUnits: (instrument: string) => get().practiceUnits[instrument] || [],
      addPracticeUnit: (instrument: string, unit: Omit<PracticeUnit, "id">) =>
        set((state) => ({
          practiceUnits: {
            ...state.practiceUnits,
            [instrument]: [
              ...(state.practiceUnits[instrument] || []),
              { ...unit, id: crypto.randomUUID() },
            ],
          },
        })),
      updatePracticeUnit: (instrument: string, unitId: string, updates: Partial<Omit<PracticeUnit, "id">>) =>
        set((state) => ({
          practiceUnits: {
            ...state.practiceUnits,
            [instrument]: (state.practiceUnits[instrument] || []).map((unit) =>
              unit.id === unitId ? { ...unit, ...updates } : unit
            ),
          },
        })),
      deletePracticeUnit: (instrument: string, unitId: string) =>
        set((state) => ({
          practiceUnits: {
            ...state.practiceUnits,
            [instrument]: (state.practiceUnits[instrument] || []).filter((unit) => unit.id !== unitId),
          },
        })),
      updateLastTempo: (instrument: string, unitId: string, newTempo: number) =>
        set((state) => ({
          practiceUnits: {
            ...state.practiceUnits,
            [instrument]: (state.practiceUnits[instrument] || []).map((unit) =>
              unit.id === unitId ? { ...unit, lastTempo: newTempo } : unit
            ),
          },
        })),
    }),
    {
      name: "practice-storage",
    }
  )
);

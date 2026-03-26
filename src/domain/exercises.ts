import type { Exercise, Instrument } from "@/domain/types";

export interface ExerciseGroup {
  label: string;
  exercises: Exercise[];
}

// Circle of fifths, alternating sharps and flats sides
const MAJOR_COF = ["c", "g", "f", "d", "bb", "a", "eb", "e", "ab", "b", "db", "gb"];
const MINOR_COF = ["a", "e", "d", "b", "g", "fs", "c", "cs", "f", "gs", "bb", "eb"];

function cofIndex(id: string, cofOrder: string[]): number {
  for (let i = 0; i < cofOrder.length; i++) {
    if (id.includes(`-${cofOrder[i]}-`)) return i;
  }
  return cofOrder.length;
}

function sortByCircleOfFifths(exercises: Exercise[], cofOrder: string[]): Exercise[] {
  return [...exercises].sort((a, b) => cofIndex(a.id, cofOrder) - cofIndex(b.id, cofOrder));
}

function categoryOf(ex: Exercise): string {
  if (ex.instrument === "guitar") return "Guitar Exercises";
  if (ex.id.includes("-major-scale")) return "Major Scales";
  if (ex.id.includes("-natural-minor")) return "Natural Minor Scales";
  if (ex.id.includes("-harmonic-minor")) return "Harmonic Minor Scales";
  if (ex.id.includes("-melodic-minor")) return "Melodic Minor Scales";
  if (ex.id.includes("-arpeggio")) return "Arpeggios";
  return "Other";
}

export function groupExercises(exercises: Exercise[], instrument: Instrument): ExerciseGroup[] {
  const filtered = exercises.filter((ex) => ex.instrument === instrument);
  const byCategory = new Map<string, Exercise[]>();

  for (const ex of filtered) {
    const cat = categoryOf(ex);
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(ex);
  }

  const groupOrder =
    instrument === "piano"
      ? [
          "Major Scales",
          "Natural Minor Scales",
          "Harmonic Minor Scales",
          "Melodic Minor Scales",
          "Arpeggios",
          "Other",
        ]
      : ["Guitar Exercises", "Other"];

  const groups: ExerciseGroup[] = [];
  for (const label of groupOrder) {
    const exs = byCategory.get(label);
    if (exs && exs.length > 0) {
      const cof = label === "Major Scales" ? MAJOR_COF : MINOR_COF;
      groups.push({ label, exercises: sortByCircleOfFifths(exs, cof) });
    }
  }
  return groups;
}

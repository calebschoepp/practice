import type { Exercise, Instrument } from "@/domain/types";

export interface ExerciseGroup {
  label: string;
  exercises: Exercise[];
}

// Circle of fifths, alternating sharps and flats sides
const MAJOR_COF = ["c", "g", "f", "d", "bb", "a", "eb", "e", "ab", "b", "db", "gb"];
const MINOR_COF = ["a", "e", "d", "b", "g", "fs", "c", "cs", "f", "gs", "bb", "eb"];

// All key slugs used in exercise IDs
const ALL_KEY_SLUGS = new Set([...MAJOR_COF, ...MINOR_COF]);

export interface PianoKey {
  slug: string;
  label: string;
}

export const PIANO_KEYS: PianoKey[] = [
  { slug: "c", label: "C" },
  { slug: "g", label: "G" },
  { slug: "f", label: "F" },
  { slug: "d", label: "D" },
  { slug: "bb", label: "B♭" },
  { slug: "a", label: "A" },
  { slug: "eb", label: "E♭" },
  { slug: "e", label: "E" },
  { slug: "ab", label: "A♭" },
  { slug: "b", label: "B" },
  { slug: "db", label: "D♭" },
  { slug: "gb", label: "F♯/G♭" },
];

// Map enharmonic minor slugs to their canonical major-side slug
const ENHARMONIC_MAP: Record<string, string> = {
  fs: "gb",
  cs: "db",
  gs: "ab",
};

/** Extract key slug from exercise ID, normalized to canonical PIANO_KEYS slug */
export function exerciseKeySlug(id: string): string | null {
  // IDs are like: piano-{key}-major-scale, piano-{key}-minor-arpeggio, etc.
  const match = id.match(/^piano-([a-z]+)-/);
  if (!match) return null;
  const slug = match[1]!;
  const canonical = ENHARMONIC_MAP[slug] ?? slug;
  return ALL_KEY_SLUGS.has(slug) ? canonical : null;
}

/** Get all exercises for a given key slug */
export function exercisesForKey(exercises: Exercise[], slug: string): Exercise[] {
  return exercises.filter((e) => exerciseKeySlug(e.id) === slug);
}

/** Compute toggle status for a key: all enabled, some enabled, or none */
export function keyToggleStatus(
  exercises: Exercise[],
  slug: string,
  disabledIds: Set<string>
): "all" | "some" | "none" {
  const keyExs = exercisesForKey(exercises, slug);
  if (keyExs.length === 0) return "none";
  const enabledCount = keyExs.filter((e) => !disabledIds.has(e.id)).length;
  if (enabledCount === keyExs.length) return "all";
  if (enabledCount > 0) return "some";
  return "none";
}

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
  if (ex.id.includes("-major-arpeggio")) return "Major Arpeggios";
  if (ex.id.includes("-minor-arpeggio")) return "Minor Arpeggios";
  if (ex.id.includes("-major-triad")) return "Major Triads";
  if (ex.id.includes("-minor-triad")) return "Minor Triads";
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
          "Major Arpeggios",
          "Minor Arpeggios",
          "Major Triads",
          "Minor Triads",
          "Other",
        ]
      : ["Guitar Exercises", "Other"];

  const groups: ExerciseGroup[] = [];
  for (const label of groupOrder) {
    const exs = byCategory.get(label);
    if (exs && exs.length > 0) {
      const cof = label.startsWith("Major") ? MAJOR_COF : MINOR_COF;
      groups.push({ label, exercises: sortByCircleOfFifths(exs, cof) });
    }
  }
  return groups;
}

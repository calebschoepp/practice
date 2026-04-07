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

const RELATIVE_MINOR_BY_MAJOR = MAJOR_COF.reduce<Record<string, string>>((acc, major, index) => {
  const minor = MINOR_COF[index]!;
  acc[major] = ENHARMONIC_MAP[minor] ?? minor;
  return acc;
}, {});

type ExerciseMode = "major" | "minor" | "neutral";

function parseExerciseId(id: string): { canonicalSlug: string; mode: ExerciseMode } | null {
  const match = id.match(/^piano-([a-z]+)-/);
  if (!match) return null;

  const slug = match[1]!;
  if (!ALL_KEY_SLUGS.has(slug)) return null;

  const canonicalSlug = ENHARMONIC_MAP[slug] ?? slug;
  const mode = id.includes("-major-") ? "major" : id.includes("-minor-") ? "minor" : "neutral";
  return { canonicalSlug, mode };
}

/** Extract key slug from exercise ID, normalized to canonical PIANO_KEYS slug */
export function exerciseKeySlug(id: string): string | null {
  return parseExerciseId(id)?.canonicalSlug ?? null;
}

/** Get all exercises for a major key button, including its relative minor */
export function exercisesForKey(exercises: Exercise[], slug: string): Exercise[] {
  const canonicalMajor = ENHARMONIC_MAP[slug] ?? slug;
  const relativeMinor = RELATIVE_MINOR_BY_MAJOR[canonicalMajor];

  return exercises.filter((e) => {
    const parsed = parseExerciseId(e.id);
    if (!parsed) return false;

    if (parsed.canonicalSlug === canonicalMajor) {
      return relativeMinor ? parsed.mode !== "minor" : true;
    }

    if (relativeMinor && parsed.canonicalSlug === relativeMinor) {
      return parsed.mode === "minor";
    }

    return false;
  });
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
  // Inversions must be checked before root-position triads
  if (ex.id.includes("-major-triad-1st")) return "Major Triads — 1st Inv.";
  if (ex.id.includes("-major-triad-2nd")) return "Major Triads — 2nd Inv.";
  if (ex.id.includes("-minor-triad-1st")) return "Minor Triads — 1st Inv.";
  if (ex.id.includes("-minor-triad-2nd")) return "Minor Triads — 2nd Inv.";
  if (ex.id.includes("-major-triad")) return "Major Triads";
  if (ex.id.includes("-minor-triad")) return "Minor Triads";
  if (ex.id.includes("-formula-pattern")) return "Formula Patterns";
  if (ex.id.includes("-chromatic-scale")) return "Chromatic Scales";
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
          "Major Triads — 1st Inv.",
          "Major Triads — 2nd Inv.",
          "Minor Triads",
          "Minor Triads — 1st Inv.",
          "Minor Triads — 2nd Inv.",
          "Formula Patterns",
          "Chromatic Scales",
        ]
      : ["Guitar Exercises"];

  const groups: ExerciseGroup[] = [];
  for (const label of groupOrder) {
    const exs = byCategory.get(label);
    if (exs && exs.length > 0) {
      const cof = label.includes("Minor") ? MINOR_COF : MAJOR_COF;
      groups.push({ label, exercises: sortByCircleOfFifths(exs, cof) });
    }
  }
  return groups;
}

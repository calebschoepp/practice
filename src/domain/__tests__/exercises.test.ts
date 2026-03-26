import { test, expect } from "bun:test";
import { groupExercises, exerciseKeySlug, PIANO_KEYS, keyToggleStatus } from "@/domain/exercises";
import { EXERCISES } from "@/catalog/catalog";
import type { Exercise } from "@/domain/types";

function stubExercise(id: string, name: string): Exercise {
  return {
    id,
    instrument: "piano",
    name,
    defaultTempo: 80,
    fingering: { type: "piano", hands: [{ hand: "RH", keys: [] }] },
  };
}

test("groupExercises sorts major scales in circle of fifths order", () => {
  // Feed exercises in alphabetical ID order (how IndexedDB returns them)
  const exercises: Exercise[] = [
    stubExercise("piano-a-major-scale", "A Major Scale"),
    stubExercise("piano-b-major-scale", "B Major Scale"),
    stubExercise("piano-bb-major-scale", "B♭ Major Scale"),
    stubExercise("piano-c-major-scale", "C Major Scale"),
    stubExercise("piano-d-major-scale", "D Major Scale"),
    stubExercise("piano-db-major-scale", "D♭ Major Scale"),
    stubExercise("piano-e-major-scale", "E Major Scale"),
    stubExercise("piano-eb-major-scale", "E♭ Major Scale"),
    stubExercise("piano-f-major-scale", "F Major Scale"),
    stubExercise("piano-g-major-scale", "G Major Scale"),
    stubExercise("piano-gb-major-scale", "F♯/G♭ Major Scale"),
    stubExercise("piano-ab-major-scale", "A♭ Major Scale"),
  ];

  const groups = groupExercises(exercises, "piano");
  const majorGroup = groups.find((g) => g.label === "Major Scales");
  expect(majorGroup).toBeDefined();

  const names = majorGroup!.exercises.map((e) => e.name);
  expect(names).toEqual([
    "C Major Scale",
    "G Major Scale",
    "F Major Scale",
    "D Major Scale",
    "B♭ Major Scale",
    "A Major Scale",
    "E♭ Major Scale",
    "E Major Scale",
    "A♭ Major Scale",
    "B Major Scale",
    "D♭ Major Scale",
    "F♯/G♭ Major Scale",
  ]);
});

test("groupExercises sorts minor scales in circle of fifths order", () => {
  const exercises: Exercise[] = [
    stubExercise("piano-a-natural-minor-scale", "A Natural Minor Scale"),
    stubExercise("piano-b-natural-minor-scale", "B Natural Minor Scale"),
    stubExercise("piano-bb-natural-minor-scale", "B♭ Natural Minor Scale"),
    stubExercise("piano-c-natural-minor-scale", "C Natural Minor Scale"),
    stubExercise("piano-cs-natural-minor-scale", "C♯ Natural Minor Scale"),
    stubExercise("piano-d-natural-minor-scale", "D Natural Minor Scale"),
    stubExercise("piano-e-natural-minor-scale", "E Natural Minor Scale"),
    stubExercise("piano-eb-natural-minor-scale", "D♯/E♭ Natural Minor Scale"),
    stubExercise("piano-f-natural-minor-scale", "F Natural Minor Scale"),
    stubExercise("piano-fs-natural-minor-scale", "F♯ Natural Minor Scale"),
    stubExercise("piano-g-natural-minor-scale", "G Natural Minor Scale"),
    stubExercise("piano-gs-natural-minor-scale", "G♯ Natural Minor Scale"),
  ];

  const groups = groupExercises(exercises, "piano");
  const minorGroup = groups.find((g) => g.label === "Natural Minor Scales");
  expect(minorGroup).toBeDefined();

  const names = minorGroup!.exercises.map((e) => e.name);
  expect(names).toEqual([
    "A Natural Minor Scale",
    "E Natural Minor Scale",
    "D Natural Minor Scale",
    "B Natural Minor Scale",
    "G Natural Minor Scale",
    "F♯ Natural Minor Scale",
    "C Natural Minor Scale",
    "C♯ Natural Minor Scale",
    "F Natural Minor Scale",
    "G♯ Natural Minor Scale",
    "B♭ Natural Minor Scale",
    "D♯/E♭ Natural Minor Scale",
  ]);
});

test("groupExercises categorizes major arpeggios separately from minor arpeggios", () => {
  const exercises: Exercise[] = [
    stubExercise("piano-c-major-arpeggio", "C Major Arpeggio"),
    stubExercise("piano-c-minor-arpeggio", "C Minor Arpeggio"),
    stubExercise("piano-g-major-arpeggio", "G Major Arpeggio"),
  ];

  const groups = groupExercises(exercises, "piano");
  const majorArp = groups.find((g) => g.label === "Major Arpeggios");
  const minorArp = groups.find((g) => g.label === "Minor Arpeggios");
  expect(majorArp).toBeDefined();
  expect(minorArp).toBeDefined();
  expect(majorArp!.exercises).toHaveLength(2);
  expect(minorArp!.exercises).toHaveLength(1);
});

test("groupExercises categorizes major triads separately from minor triads", () => {
  const exercises: Exercise[] = [
    stubExercise("piano-c-major-triad", "C Major Triad"),
    stubExercise("piano-c-minor-triad", "C Minor Triad"),
    stubExercise("piano-d-major-triad", "D Major Triad"),
    stubExercise("piano-d-minor-triad", "D Minor Triad"),
  ];

  const groups = groupExercises(exercises, "piano");
  const majorTriad = groups.find((g) => g.label === "Major Triads");
  const minorTriad = groups.find((g) => g.label === "Minor Triads");
  expect(majorTriad).toBeDefined();
  expect(minorTriad).toBeDefined();
  expect(majorTriad!.exercises).toHaveLength(2);
  expect(minorTriad!.exercises).toHaveLength(2);
});

test("catalog has 12 major arpeggios, 12 minor arpeggios, 12 major triads, 12 minor triads", () => {
  const groups = groupExercises(EXERCISES, "piano");
  const majorArp = groups.find((g) => g.label === "Major Arpeggios");
  const minorArp = groups.find((g) => g.label === "Minor Arpeggios");
  const majorTriad = groups.find((g) => g.label === "Major Triads");
  const minorTriad = groups.find((g) => g.label === "Minor Triads");

  expect(majorArp!.exercises).toHaveLength(12);
  expect(minorArp!.exercises).toHaveLength(12);
  expect(majorTriad!.exercises).toHaveLength(12);
  expect(minorTriad!.exercises).toHaveLength(12);
});

test("catalog arpeggios and triads are sorted in circle of fifths order", () => {
  const groups = groupExercises(EXERCISES, "piano");
  const majorArp = groups.find((g) => g.label === "Major Arpeggios")!;
  const expectedMajorOrder = [
    "C Major Arpeggio",
    "G Major Arpeggio",
    "F Major Arpeggio",
    "D Major Arpeggio",
    "B♭ Major Arpeggio",
    "A Major Arpeggio",
    "E♭ Major Arpeggio",
    "E Major Arpeggio",
    "A♭ Major Arpeggio",
    "B Major Arpeggio",
    "D♭ Major Arpeggio",
    "F♯/G♭ Major Arpeggio",
  ];
  expect(majorArp.exercises.map((e) => e.name)).toEqual(expectedMajorOrder);
});

test("exerciseKeySlug extracts key from exercise IDs", () => {
  expect(exerciseKeySlug("piano-c-major-scale")).toBe("c");
  expect(exerciseKeySlug("piano-bb-major-scale")).toBe("bb");
  expect(exerciseKeySlug("piano-gb-major-scale")).toBe("gb");
  expect(exerciseKeySlug("piano-fs-natural-minor-scale")).toBe("gb"); // fs → gb (enharmonic)
  expect(exerciseKeySlug("piano-cs-minor-arpeggio")).toBe("db"); // cs → db
  expect(exerciseKeySlug("piano-ab-major-triad")).toBe("ab");
  expect(exerciseKeySlug("guitar-e-minor-pentatonic")).toBeNull();
});

test("PIANO_KEYS contains all 12 keys in circle-of-fifths order with display labels", () => {
  expect(PIANO_KEYS).toHaveLength(12);
  expect(PIANO_KEYS[0]).toEqual({ slug: "c", label: "C" });
  expect(PIANO_KEYS[1]).toEqual({ slug: "g", label: "G" });
  expect(PIANO_KEYS[11]).toEqual({ slug: "gb", label: "F♯/G♭" });
});

test("every piano exercise in catalog has a recognized key slug", () => {
  const pianoExercises = EXERCISES.filter((e) => e.instrument === "piano");
  for (const ex of pianoExercises) {
    const slug = exerciseKeySlug(ex.id);
    expect(slug).not.toBeNull();
    expect(PIANO_KEYS.some((k) => k.slug === slug)).toBe(true);
  }
});

test("keyToggleStatus returns 'all' when no exercises are disabled", () => {
  const exercises = [
    stubExercise("piano-c-major-scale", "C Major Scale"),
    stubExercise("piano-c-major-arpeggio", "C Major Arpeggio"),
    stubExercise("piano-c-major-triad", "C Major Triad"),
  ];
  const disabledIds = new Set<string>();
  expect(keyToggleStatus(exercises, "c", disabledIds)).toBe("all");
});

test("keyToggleStatus returns 'none' when all exercises are disabled", () => {
  const exercises = [
    stubExercise("piano-c-major-scale", "C Major Scale"),
    stubExercise("piano-c-major-arpeggio", "C Major Arpeggio"),
  ];
  const disabledIds = new Set(["piano-c-major-scale", "piano-c-major-arpeggio"]);
  expect(keyToggleStatus(exercises, "c", disabledIds)).toBe("none");
});

test("keyToggleStatus returns 'some' when only some exercises are disabled", () => {
  const exercises = [
    stubExercise("piano-c-major-scale", "C Major Scale"),
    stubExercise("piano-c-major-arpeggio", "C Major Arpeggio"),
    stubExercise("piano-c-major-triad", "C Major Triad"),
  ];
  const disabledIds = new Set(["piano-c-major-arpeggio"]);
  expect(keyToggleStatus(exercises, "c", disabledIds)).toBe("some");
});

test("catalog has triad inversions, formula patterns, and chromatic scales", () => {
  const groups = groupExercises(EXERCISES, "piano");

  const majorTriad1st = groups.find((g) => g.label === "Major Triads — 1st Inv.");
  const majorTriad2nd = groups.find((g) => g.label === "Major Triads — 2nd Inv.");
  const minorTriad1st = groups.find((g) => g.label === "Minor Triads — 1st Inv.");
  const minorTriad2nd = groups.find((g) => g.label === "Minor Triads — 2nd Inv.");
  const formulaPatterns = groups.find((g) => g.label === "Formula Patterns");
  const chromaticScales = groups.find((g) => g.label === "Chromatic Scales");

  expect(majorTriad1st!.exercises).toHaveLength(12);
  expect(majorTriad2nd!.exercises).toHaveLength(12);
  expect(minorTriad1st!.exercises).toHaveLength(12);
  expect(minorTriad2nd!.exercises).toHaveLength(12);
  expect(formulaPatterns!.exercises).toHaveLength(12);
  expect(chromaticScales!.exercises).toHaveLength(12);
});

test("no exercises fall into Other category", () => {
  const groups = groupExercises(EXERCISES, "piano");
  const other = groups.find((g) => g.label === "Other");
  expect(other).toBeUndefined();
});

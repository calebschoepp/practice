import { test, expect } from "bun:test";
import { groupExercises } from "@/domain/exercises";
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

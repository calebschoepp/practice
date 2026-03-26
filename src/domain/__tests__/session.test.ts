import { describe, expect, test } from "bun:test";
import {
  createNextQueueItem,
  createPracticeQueue,
  getSessionExerciseTarget,
} from "@/domain/session";
import type { Exercise, Variation } from "@/domain/types";

const exercises: Exercise[] = [
  {
    id: "a",
    instrument: "piano",
    name: "A",
    defaultTempo: 80,
    fingering: { type: "piano", hands: [{ hand: "RH", keys: [] }] },
  },
  {
    id: "b",
    instrument: "piano",
    name: "B",
    defaultTempo: 90,
    fingering: { type: "piano", hands: [{ hand: "RH", keys: [] }] },
  },
];

const variations: Variation[] = [
  { id: "v1", name: "V1", description: "desc" },
  { id: "v2", name: "V2", description: "desc" },
];

describe("session queue", () => {
  test("maps lengths to targets", () => {
    expect(getSessionExerciseTarget("short")).toBe(3);
    expect(getSessionExerciseTarget("long")).toBe(5);
    expect(getSessionExerciseTarget("unlimited")).toBeNull();
  });

  test("generates finite queue with expected size", () => {
    const queue = createPracticeQueue(exercises, variations, "long", () => 0.1);
    expect(queue).toHaveLength(5);
    expect(queue[0]?.exercise.id).toBeDefined();
    expect(queue[0]?.variation.id).toBeDefined();
  });

  test("unlimited mode starts with a single item", () => {
    const queue = createPracticeQueue(exercises, variations, "unlimited", () => 0.2);
    expect(queue).toHaveLength(1);
  });

  test("next queue item avoids immediate repeat when possible", () => {
    const next = createNextQueueItem(exercises, variations, "a", () => 0);
    expect(next.exercise.id).toBe("b");
  });
});

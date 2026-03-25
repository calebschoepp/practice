import type { Exercise, PracticeLength, SessionQueueItem, Variation } from "@/domain/types";

const LENGTH_TARGETS: Record<Exclude<PracticeLength, "unlimited">, number> = {
  short: 3,
  long: 5,
};

export function getSessionExerciseTarget(length: PracticeLength): number | null {
  if (length === "unlimited") return null;
  return LENGTH_TARGETS[length];
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = out[i];
    out[i] = out[j]!;
    out[j] = temp!;
  }
  return out;
}

export function createPracticeQueue(
  exercises: Exercise[],
  variations: Variation[],
  length: PracticeLength,
  random: () => number = Math.random
): SessionQueueItem[] {
  if (exercises.length === 0 || variations.length === 0) return [];
  const target = getSessionExerciseTarget(length);
  if (target === null) {
    return [createNextQueueItem(exercises, variations, undefined, random)];
  }

  const shuffled = shuffle(exercises, random);
  const queue: SessionQueueItem[] = [];

  for (let i = 0; i < target; i++) {
    const exercise = shuffled[i % shuffled.length]!;
    const variation = variations[i % variations.length]!;
    queue.push({ exercise, variation });
  }

  return queue;
}

export function createNextQueueItem(
  exercises: Exercise[],
  variations: Variation[],
  previousExerciseId?: string,
  random: () => number = Math.random
): SessionQueueItem {
  const exercisePool = exercises.filter((exercise) => exercise.id !== previousExerciseId);
  const candidateExercises = exercisePool.length > 0 ? exercisePool : exercises;
  const exercise = candidateExercises[Math.floor(random() * candidateExercises.length)]!;
  const variation = variations[Math.floor(random() * variations.length)]!;
  return { exercise, variation };
}

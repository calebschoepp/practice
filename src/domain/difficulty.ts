export type Difficulty = 0 | 1 | 2 | 3 | 4;

const DIFFICULTY_VALUES: Difficulty[] = [0, 1, 2, 3, 4];

export function stepDifficulty(current: Difficulty, key: "ArrowUp" | "ArrowDown"): Difficulty {
  const currentIndex = DIFFICULTY_VALUES.indexOf(current);
  const direction = key === "ArrowUp" ? -1 : 1;
  const nextIndex = Math.min(DIFFICULTY_VALUES.length - 1, Math.max(0, currentIndex + direction));
  return DIFFICULTY_VALUES[nextIndex]!;
}

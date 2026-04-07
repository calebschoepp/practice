import { expect, test } from "bun:test";
import { stepDifficulty } from "@/domain/difficulty";

test("arrow up chooses a lower difficulty", () => {
  expect(stepDifficulty(2, "ArrowUp")).toBe(1);
});

test("arrow down chooses a higher difficulty", () => {
  expect(stepDifficulty(2, "ArrowDown")).toBe(3);
});

test("difficulty stepping clamps at bounds", () => {
  expect(stepDifficulty(0, "ArrowUp")).toBe(0);
  expect(stepDifficulty(4, "ArrowDown")).toBe(4);
});

import { describe, expect, test } from "bun:test";
import { shouldSeed, upsertById } from "@/storage/seed";

describe("seed helpers", () => {
  test("determines whether seed should run", () => {
    expect(shouldSeed(undefined, 1)).toBe(true);
    expect(shouldSeed(0, 1)).toBe(true);
    expect(shouldSeed(1, 1)).toBe(false);
  });

  test("upserts by stable IDs idempotently", () => {
    const first = upsertById(
      [{ id: "a", value: 1 }],
      [
        { id: "a", value: 2 },
        { id: "b", value: 3 },
      ]
    );

    const second = upsertById(first, [
      { id: "a", value: 2 },
      { id: "b", value: 3 },
    ]);

    expect(first).toHaveLength(2);
    expect(second).toHaveLength(2);
    expect(second.find((item) => item.id === "a")?.value).toBe(2);
  });
});

import { describe, test, expect } from "bun:test";
import { computePianoKeyRange, countWhiteKeysInRange, WHITE_W } from "../PianoKeyboard";
import type { PianoHand } from "@/domain/types";

describe("PianoKeyboard helpers", () => {
  test("countWhiteKeysInRange returns 7 for one octave (C to B)", () => {
    // C1 (global 12) to B1 (global 23) = 1 octave
    expect(countWhiteKeysInRange({ start: 12, end: 23 })).toBe(7);
  });

  test("countWhiteKeysInRange returns 14 for two octaves", () => {
    // C1 (12) to B2 (35) = 2 octaves
    expect(countWhiteKeysInRange({ start: 12, end: 35 })).toBe(14);
  });

  test("countWhiteKeysInRange returns 21 for three octaves", () => {
    // C1 (12) to B3 (47) = 3 octaves
    expect(countWhiteKeysInRange({ start: 12, end: 47 })).toBe(21);
  });

  test("keyboard pixel width is white keys × WHITE_W", () => {
    const range = { start: 12, end: 47 }; // 3 octaves
    const whiteKeys = countWhiteKeysInRange(range);
    expect(whiteKeys * WHITE_W).toBe(21 * 22); // 462px
  });

  test("computePianoKeyRange snaps to full octaves", () => {
    // G1 (global 19) to G3 (global 43) — should snap to C1 (12) to B3 (47)
    const hands: PianoHand[] = [
      {
        hand: "RH",
        keys: [
          { note: "G", octave: 1, finger: 1 },
          { note: "G", octave: 3, finger: 1 },
        ],
      },
    ];
    const range = computePianoKeyRange(hands);
    expect(range.start).toBe(12); // C1
    expect(range.end).toBe(47); // B3
  });

  test("computePianoKeyRange uses same range for all 2-octave scales", () => {
    // All 2-octave scales starting from octave 1 should snap to C1-B3
    const hands: PianoHand[] = [
      {
        hand: "RH",
        keys: [
          { note: "D", octave: 1, finger: 1 },
          { note: "D", octave: 3, finger: 1 },
        ],
      },
    ];
    const range = computePianoKeyRange(hands);
    expect(range.start).toBe(12);
    expect(range.end).toBe(47);
    expect(countWhiteKeysInRange(range)).toBe(21);
  });
});

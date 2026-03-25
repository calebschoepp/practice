import type { Exercise, Variation } from "@/domain/types";

export const CURRENT_SEED_VERSION = 1;

export const EXERCISES: Exercise[] = [
  {
    id: "piano-c-major-scale",
    instrument: "piano",
    name: "C Major Scale",
    defaultTempo: 88,
    fingering: ["RH: 1-2-3-1-2-3-4-5", "LH: 5-4-3-2-1-3-2-1"],
  },
  {
    id: "piano-arpeggio-c-major",
    instrument: "piano",
    name: "C Major Arpeggio",
    defaultTempo: 76,
    fingering: ["RH: 1-2-3-5", "LH: 5-3-2-1"],
  },
  {
    id: "piano-hanon-1",
    instrument: "piano",
    name: "Hanon No. 1",
    defaultTempo: 82,
    fingering: ["12345 4321", "Keep wrists relaxed"],
  },
  {
    id: "guitar-e-minor-pentatonic",
    instrument: "guitar",
    name: "E Minor Pentatonic",
    defaultTempo: 94,
    fingering: ["12-14 on D/G/B", "12-15 on low/high E"],
  },
  {
    id: "guitar-open-chord-switches",
    instrument: "guitar",
    name: "Open Chord Switches",
    defaultTempo: 72,
    fingering: ["G -> C -> D -> Em", "Use guide fingers"],
  },
  {
    id: "guitar-alternate-picking-1234",
    instrument: "guitar",
    name: "Alternate Picking 1-2-3-4",
    defaultTempo: 90,
    fingering: ["One finger per fret", "Strict alternate picking"],
  },
];

export const VARIATIONS: Variation[] = [
  { id: "straight", name: "Straight", description: "Even subdivisions" },
  { id: "staccato", name: "Staccato", description: "Short and detached" },
  { id: "accent-2-and-4", name: "Accent 2&4", description: "Accent backbeat" },
  { id: "crescendo", name: "Crescendo", description: "Get louder each pass" },
];

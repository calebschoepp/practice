import type { NoteName, PianoHand } from "@/domain/types";

interface PianoKeyboardProps {
  hand: PianoHand;
}

const NOTE_ORDER: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const BLACK_NOTES = new Set<NoteName>(["C#", "D#", "F#", "G#", "A#"]);

function isBlack(note: NoteName) {
  return BLACK_NOTES.has(note);
}

/** Build the list of all keys across 2 octaves + top C */
function buildKeys() {
  const keys: { note: NoteName; octave: 1 | 2 | 3; isBlack: boolean }[] = [];
  for (const oct of [1, 2] as const) {
    for (const note of NOTE_ORDER) {
      keys.push({ note, octave: oct, isBlack: isBlack(note) });
    }
  }
  // Add top C
  keys.push({ note: "C", octave: 3, isBlack: false });
  return keys;
}

const ALL_KEYS = buildKeys();
const WHITE_KEYS = ALL_KEYS.filter((k) => !k.isBlack);
const WHITE_KEY_COUNT = WHITE_KEYS.length; // 15

const SVG_W = 280;
const WHITE_W = SVG_W / WHITE_KEY_COUNT; // 20
const WHITE_H = 80;
const BLACK_W = WHITE_W * 0.6; // 12
const BLACK_H = WHITE_H * 0.6; // 48

/** Get x position for a white key by its index among white keys */
function whiteKeyX(index: number) {
  return index * WHITE_W;
}

/** Get x position for a black key based on which white key it follows */
function blackKeyX(note: NoteName, octave: 1 | 2 | 3) {
  // Find the white key just before this black key
  const whiteIndex = WHITE_KEYS.findIndex((wk) => {
    const noteIdx = NOTE_ORDER.indexOf(note);
    const prevWhiteNote = NOTE_ORDER[noteIdx - 1];
    return wk.note === prevWhiteNote && wk.octave === octave;
  });
  return whiteKeyX(whiteIndex) + WHITE_W - BLACK_W / 2;
}

export function PianoKeyboard({ hand }: PianoKeyboardProps) {
  const fingerMap = new Map<string, number>();
  for (const k of hand.keys) {
    fingerMap.set(`${k.note}-${k.octave}`, k.finger);
  }

  const kbY = 4;
  const totalH = kbY + WHITE_H + 2;

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">
        {hand.hand === "RH" ? "Right Hand" : "Left Hand"}
      </p>
      <svg
        viewBox={`0 0 ${SVG_W} ${totalH}`}
        className="w-full"
        role="img"
        aria-label={`${hand.hand === "RH" ? "Right" : "Left"} hand fingering`}
      >
        {/* White keys */}
        {WHITE_KEYS.map((key, i) => {
          const x = whiteKeyX(i);
          const id = `${key.note}-${key.octave}`;
          const finger = fingerMap.get(id);
          const highlighted = finger !== undefined;
          return (
            <g key={id}>
              <rect
                x={x}
                y={kbY}
                width={WHITE_W}
                height={WHITE_H}
                rx={2}
                fill={highlighted ? "#fef9c3" : "white"}
                className="stroke-border"
                strokeWidth={0.5}
              />
              {highlighted && (
                <text
                  x={x + WHITE_W / 2}
                  y={kbY + WHITE_H - 10}
                  textAnchor="middle"
                  className="fill-foreground font-mono text-[11px] font-bold"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}

        {/* Black keys on top */}
        {ALL_KEYS.filter((k) => k.isBlack).map((key) => {
          const x = blackKeyX(key.note, key.octave);
          const id = `${key.note}-${key.octave}`;
          const finger = fingerMap.get(id);
          const highlighted = finger !== undefined;
          return (
            <g key={id}>
              <rect
                x={x}
                y={kbY}
                width={BLACK_W}
                height={BLACK_H}
                rx={1.5}
                fill={highlighted ? "#fef08a" : undefined}
                className={highlighted ? "stroke-yellow-400" : "fill-foreground stroke-foreground"}
                strokeWidth={0.5}
              />
              {highlighted && (
                <text
                  x={x + BLACK_W / 2}
                  y={kbY + BLACK_H - 6}
                  textAnchor="middle"
                  className="fill-foreground font-mono text-[9px] font-bold"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

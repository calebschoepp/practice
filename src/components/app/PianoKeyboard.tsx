import type { NoteName, PianoHand } from "@/domain/types";

const NOTE_ORDER: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const BLACK_NOTES = new Set<NoteName>(["C#", "D#", "F#", "G#", "A#"]);

function isBlack(note: NoteName) {
  return BLACK_NOTES.has(note);
}

interface KeyDef {
  note: NoteName;
  octave: number;
  isBlack: boolean;
}

const WHITE_W = 22;
const WHITE_H = 80;
const BLACK_W = WHITE_W * 0.6;
const BLACK_H = WHITE_H * 0.6;

/** Compute the key range needed across all hands: start at C of min octave, end at B of max octave */
export function computePianoKeyRange(hands: PianoHand[]): { start: number; end: number } {
  const toGlobal = (note: NoteName, octave: number) => octave * 12 + NOTE_ORDER.indexOf(note);
  let min = Infinity;
  let max = -Infinity;
  for (const hand of hands) {
    for (const k of hand.keys) {
      const g = toGlobal(k.note, k.octave);
      min = Math.min(min, g);
      max = Math.max(max, g);
    }
  }
  if (!isFinite(min)) return { start: 12, end: 47 }; // fallback: C1-B3
  return {
    start: Math.floor(min / 12) * 12, // snap down to C
    end: Math.floor(max / 12) * 12 + 11, // snap up to B
  };
}

interface PianoKeyboardProps {
  hand: PianoHand;
  range: { start: number; end: number };
}

export function PianoKeyboard({ hand, range }: PianoKeyboardProps) {
  const allKeys: KeyDef[] = [];
  for (let g = range.start; g <= range.end; g++) {
    const note = NOTE_ORDER[g % 12]!;
    const octave = Math.floor(g / 12);
    allKeys.push({ note, octave, isBlack: isBlack(note) });
  }

  const whiteKeys = allKeys.filter((k) => !k.isBlack);
  const whiteCount = whiteKeys.length;

  if (whiteCount === 0) return null;

  const SVG_W = whiteCount * WHITE_W;

  const fingerMap = new Map<string, number>();
  for (const k of hand.keys) {
    fingerMap.set(`${k.note}-${k.octave}`, k.finger);
  }

  const whiteKeyX = (index: number) => index * WHITE_W;

  const blackKeyX = (note: NoteName, octave: number) => {
    const noteIdx = NOTE_ORDER.indexOf(note);
    const prevWhiteNote = NOTE_ORDER[noteIdx - 1]!;
    const whiteIndex = whiteKeys.findIndex(
      (wk) => wk.note === prevWhiteNote && wk.octave === octave
    );
    return whiteKeyX(whiteIndex) + WHITE_W - BLACK_W / 2;
  };

  const kbY = 4;
  const totalH = kbY + WHITE_H + 2;

  return (
    <div>
      <p className="sticky left-0 w-fit mb-1 text-xs font-medium text-muted-foreground">
        {hand.hand === "RH" ? "Right Hand" : "Left Hand"}
      </p>
      <svg
        viewBox={`0 0 ${SVG_W} ${totalH}`}
        width={SVG_W}
        height={totalH}
        role="img"
        aria-label={`${hand.hand === "RH" ? "Right" : "Left"} hand fingering`}
      >
        {/* White keys */}
        {whiteKeys.map((key, i) => {
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
        {allKeys
          .filter((k) => k.isBlack)
          .map((key) => {
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
                  className={
                    highlighted ? "stroke-yellow-400" : "fill-foreground stroke-foreground"
                  }
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

import type { Fingering } from "@/domain/types";
import { GuitarFretboard } from "./GuitarFretboard";
import { PianoKeyboard, computePianoKeyRange } from "./PianoKeyboard";

interface FingeringDisplayProps {
  fingering: Fingering;
}

export function FingeringDisplay({ fingering }: FingeringDisplayProps) {
  const pianoRange = fingering.type === "piano" ? computePianoKeyRange(fingering.hands) : null;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {fingering.type === "piano" ? "Keyboard Fingering" : "Fretboard Pattern"}
      </p>
      {fingering.type === "piano" && pianoRange ? (
        <div className="space-y-3">
          {fingering.hands.map((hand) => (
            <PianoKeyboard key={hand.hand} hand={hand} range={pianoRange} />
          ))}
        </div>
      ) : fingering.type === "guitar" ? (
        <GuitarFretboard fingering={fingering} />
      ) : null}
    </div>
  );
}

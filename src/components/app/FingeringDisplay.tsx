import type { Fingering } from "@/domain/types";
import { GuitarFretboard } from "./GuitarFretboard";
import { PianoKeyboard } from "./PianoKeyboard";

interface FingeringDisplayProps {
  fingering: Fingering;
}

export function FingeringDisplay({ fingering }: FingeringDisplayProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {fingering.type === "piano" ? "Keyboard Fingering" : "Fretboard Pattern"}
      </p>
      {fingering.type === "piano" ? (
        <div className="space-y-3">
          {fingering.hands.map((hand) => (
            <PianoKeyboard key={hand.hand} hand={hand} />
          ))}
        </div>
      ) : (
        <GuitarFretboard fingering={fingering} />
      )}
    </div>
  );
}

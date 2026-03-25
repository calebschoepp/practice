import type { Instrument } from "@/domain/types";

interface FingeringDisplayProps {
  instrument: Instrument;
  fingering: string[];
}

export function FingeringDisplay({ instrument, fingering }: FingeringDisplayProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {instrument === "piano" ? "Keyboard Fingering" : "Fretboard Pattern"}
      </p>
      <div className="space-y-2">
        {fingering.map((line) => (
          <p key={line} className="rounded-md bg-muted/70 px-3 py-2 font-mono text-sm">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

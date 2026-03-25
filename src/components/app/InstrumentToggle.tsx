import { Button } from "@/components/ui/button";
import type { Instrument } from "@/domain/types";
import { cn } from "@/lib/utils";

interface InstrumentToggleProps {
  value: Instrument;
  onChange: (instrument: Instrument) => void;
}

const options: Array<{ value: Instrument; label: string; emoji: string }> = [
  { value: "piano", label: "Piano", emoji: "🎹" },
  { value: "guitar", label: "Guitar", emoji: "🎸" },
];

export function InstrumentToggle({ value, onChange }: InstrumentToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Instrument toggle">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          className={cn("h-12 text-base", value === option.value && "ring-2 ring-primary/30")}
          onClick={() => onChange(option.value)}
        >
          <span>{option.emoji}</span>
          <span>{option.label}</span>
        </Button>
      ))}
    </div>
  );
}

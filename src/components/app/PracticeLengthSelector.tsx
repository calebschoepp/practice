import { Button } from "@/components/ui/button";
import type { PracticeLength } from "@/domain/types";
import { cn } from "@/lib/utils";

interface PracticeLengthSelectorProps {
  value: PracticeLength;
  onChange: (length: PracticeLength) => void;
}

const options: Array<{ value: PracticeLength; label: string; helper: string }> = [
  { value: "short", label: "Short", helper: "3 exercises" },
  { value: "long", label: "Long", helper: "5 exercises" },
  { value: "unlimited", label: "Unlimited", helper: "Open-ended" },
];

export function PracticeLengthSelector({ value, onChange }: PracticeLengthSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Practice length selector">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          className={cn("h-auto flex-col py-3", value === option.value && "ring-2 ring-primary/30")}
          onClick={() => onChange(option.value)}
        >
          <span>{option.label}</span>
          <span className="text-xs opacity-80">{option.helper}</span>
        </Button>
      ))}
    </div>
  );
}

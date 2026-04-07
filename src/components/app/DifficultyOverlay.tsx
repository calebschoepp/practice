import { Button } from "@/components/ui/button";

interface DifficultyOverlayProps {
  open: boolean;
  selectedDifficulty: 0 | 1 | 2 | 3 | 4;
  onSelect: (difficulty: 0 | 1 | 2 | 3 | 4) => void;
}

const LABELS: Array<{ value: 0 | 1 | 2 | 3 | 4; text: string }> = [
  { value: 0, text: "Terrible" },
  { value: 1, text: "Poorly" },
  { value: 2, text: "Okay" },
  { value: 3, text: "Well" },
  { value: 4, text: "Perfect" },
];

export function DifficultyOverlay({ open, selectedDifficulty, onSelect }: DifficultyOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm px-4 py-8">
      <div className="mx-auto flex h-full max-w-sm flex-col justify-center gap-4">
        <h2 className="text-center text-3xl font-semibold">How did that go?</h2>
        <p className="text-center text-sm text-muted-foreground">
          Pick a rating to log the completion.
        </p>
        {LABELS.map((item) => (
          <Button
            key={item.value}
            variant="outline"
            className={`h-12 ${
              selectedDifficulty === item.value ? "border-primary/40 bg-primary/10" : ""
            }`}
            onClick={() => onSelect(item.value)}
            data-testid={`difficulty-${item.value}`}
            aria-pressed={selectedDifficulty === item.value}
          >
            {item.text}
          </Button>
        ))}
      </div>
    </div>
  );
}

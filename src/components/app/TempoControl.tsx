import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TempoControlProps {
  tempo: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export function TempoControl({ tempo, onDecrease, onIncrease }: TempoControlProps) {
  return (
    <div className="flex items-center justify-center gap-3" aria-label="Tempo controls">
      <Button
        variant="outline"
        size="icon"
        onClick={onDecrease}
        aria-label="Decrease tempo"
        data-testid="tempo-down"
      >
        <Minus />
      </Button>
      <div className="min-w-24 text-center">
        <p className="text-2xl font-semibold tabular-nums">{tempo}</p>
        <p className="text-xs text-muted-foreground">BPM</p>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={onIncrease}
        aria-label="Increase tempo"
        data-testid="tempo-up"
      >
        <Plus />
      </Button>
    </div>
  );
}

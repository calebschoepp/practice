import { Badge } from "@/components/ui/badge";

interface ExerciseHeaderProps {
  exerciseName: string;
  variationName: string;
}

export function ExerciseHeader({ exerciseName, variationName }: ExerciseHeaderProps) {
  return (
    <div className="space-y-2 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current Exercise</p>
      <h2 className="text-3xl font-semibold leading-tight">{exerciseName}</h2>
      <Badge variant="secondary" className="text-[0.65rem] uppercase tracking-wide">
        {variationName}
      </Badge>
    </div>
  );
}

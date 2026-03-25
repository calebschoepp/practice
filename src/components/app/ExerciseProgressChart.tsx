import type { ExerciseProgressPoint } from "@/domain/types";

interface ExerciseProgressChartProps {
  points: ExerciseProgressPoint[];
}

const WIDTH = 320;
const HEIGHT = 180;
const PADDING = 24;

const difficultyColor: Record<number, string> = {
  0: "var(--color-chart-5)",
  1: "var(--color-chart-4)",
  2: "var(--color-chart-3)",
  3: "var(--color-chart-2)",
  4: "var(--color-chart-1)",
};

export function ExerciseProgressChart({ points }: ExerciseProgressChartProps) {
  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet for this exercise.</p>;
  }

  const sorted = [...points].sort((a, b) => a.endedAt.localeCompare(b.endedAt));
  const times = sorted.map((point) => new Date(point.endedAt).getTime());
  const tempos = sorted.map((point) => point.tempo);
  const minX = Math.min(...times);
  const maxX = Math.max(...times);
  const minY = Math.min(...tempos) - 3;
  const maxY = Math.max(...tempos) + 3;

  const projectX = (value: number) => {
    if (maxX === minX) return WIDTH / 2;
    return PADDING + ((value - minX) / (maxX - minX)) * (WIDTH - PADDING * 2);
  };
  const projectY = (value: number) => {
    if (maxY === minY) return HEIGHT / 2;
    return HEIGHT - PADDING - ((value - minY) / (maxY - minY)) * (HEIGHT - PADDING * 2);
  };

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full rounded-lg border bg-background"
        role="img"
      >
        <line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
          stroke="var(--color-border)"
        />
        <line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={HEIGHT - PADDING}
          stroke="var(--color-border)"
        />
        {sorted.map((point) => (
          <circle
            key={point.completionId}
            cx={projectX(new Date(point.endedAt).getTime())}
            cy={projectY(point.tempo)}
            r="4"
            fill={difficultyColor[point.difficulty]}
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>Y: tempo</span>
        <span>•</span>
        <span>X: date</span>
        <span>•</span>
        <span>Color: difficulty</span>
      </div>
    </div>
  );
}

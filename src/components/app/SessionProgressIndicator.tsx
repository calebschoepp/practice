interface SessionProgressIndicatorProps {
  completedCount: number;
  targetCount: number | null;
}

export function SessionProgressIndicator({
  completedCount,
  targetCount,
}: SessionProgressIndicatorProps) {
  const display =
    targetCount === null ? `${completedCount + 1}/∞` : `${completedCount + 1}/${targetCount}`;

  return (
    <p
      className="text-center text-sm font-medium text-muted-foreground"
      data-testid="session-progress"
    >
      Exercise {display}
    </p>
  );
}

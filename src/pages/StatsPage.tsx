import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ExerciseProgressChart } from "@/components/app/ExerciseProgressChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/domain/routes";
import type { Exercise, ExerciseProgressPoint, StatsSummary } from "@/domain/types";
import { ensureStorageBootstrapped, storageAdapter } from "@/storage";

const emptySummary: StatsSummary = {
  totalSessions: 0,
  totalPracticeMinutes: 0,
  averageSessionMinutes: 0,
  dailyStreak: 0,
  weeklyStreak: 0,
};

export function StatsPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<StatsSummary>(emptySummary);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [points, setPoints] = useState<ExerciseProgressPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      await ensureStorageBootstrapped();
      const [stats, allExercises] = await Promise.all([
        storageAdapter.getStatsSummary(),
        storageAdapter.listExercises(),
      ]);
      setSummary(stats);
      setExercises(allExercises);
      if (allExercises.length > 0) {
        setSelectedExerciseId(allExercises[0]!.id);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      navigate(ROUTES.home);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navigate]);

  useEffect(() => {
    const loadPoints = async () => {
      if (!selectedExerciseId) return;
      const next = await storageAdapter.listExerciseProgress(selectedExerciseId);
      setPoints(next);
    };
    void loadPoints();
  }, [selectedExerciseId]);

  const selectedExerciseName = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedExerciseId)?.name,
    [exercises, selectedExerciseId]
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-6">
      <header className="mb-6 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ROUTES.home)}
          aria-label="Back home"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-semibold">Stats</h1>
      </header>

      <div className="space-y-4">
        <Card data-testid="stats-summary-card">
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-semibold tabular-nums">{summary.totalSessions}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums">{summary.totalPracticeMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums">{summary.averageSessionMinutes}</p>
              <p className="text-xs text-muted-foreground">Avg Min</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Streaks</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-2xl font-semibold tabular-nums">{summary.dailyStreak}</p>
              <p className="text-xs text-muted-foreground">Daily</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{summary.weeklyStreak}</p>
              <p className="text-xs text-muted-foreground">Weekly</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercise Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4" data-testid="exercise-chart-card">
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={selectedExerciseId}
              onChange={(event) => setSelectedExerciseId(event.target.value)}
              aria-label="Select exercise"
            >
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">
              {selectedExerciseName ?? "Choose an exercise"}
            </p>
            <ExerciseProgressChart points={points} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

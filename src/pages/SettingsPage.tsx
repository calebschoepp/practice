import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/domain/routes";
import type { Exercise } from "@/domain/types";
import { ensureStorageBootstrapped, storageAdapter } from "@/storage";

interface ExerciseGroup {
  label: string;
  exercises: Exercise[];
}

function groupExercises(exercises: Exercise[]): ExerciseGroup[] {
  const groups: ExerciseGroup[] = [];
  const byCategory = new Map<string, Exercise[]>();

  for (const ex of exercises) {
    let cat: string;
    if (ex.instrument === "guitar") {
      cat = "Guitar";
    } else if (ex.id.includes("-major-scale")) {
      cat = "Major Scales";
    } else if (ex.id.includes("-natural-minor")) {
      cat = "Natural Minor Scales";
    } else if (ex.id.includes("-harmonic-minor")) {
      cat = "Harmonic Minor Scales";
    } else if (ex.id.includes("-melodic-minor")) {
      cat = "Melodic Minor Scales";
    } else if (ex.id.includes("-arpeggio")) {
      cat = "Arpeggios";
    } else {
      cat = "Other";
    }
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(ex);
  }

  const order = [
    "Major Scales",
    "Natural Minor Scales",
    "Harmonic Minor Scales",
    "Melodic Minor Scales",
    "Arpeggios",
    "Guitar",
    "Other",
  ];

  for (const label of order) {
    const exs = byCategory.get(label);
    if (exs && exs.length > 0) {
      groups.push({ label, exercises: exs });
    }
  }

  return groups;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureStorageBootstrapped();
      const [allExercises, disabled] = await Promise.all([
        storageAdapter.listExercises(),
        storageAdapter.getDisabledExerciseIds(),
      ]);
      setExercises(allExercises);
      setDisabledIds(disabled);
      setLoaded(true);
    })();
  }, []);

  const toggle = useCallback(async (exerciseId: string, enabled: boolean) => {
    await storageAdapter.setExerciseEnabled(exerciseId, enabled);
    setDisabledIds((prev) => {
      const next = new Set(prev);
      if (enabled) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  }, []);

  const toggleGroup = useCallback(async (group: ExerciseGroup, enabled: boolean) => {
    for (const ex of group.exercises) {
      await storageAdapter.setExerciseEnabled(ex.id, enabled);
    }
    setDisabledIds((prev) => {
      const next = new Set(prev);
      for (const ex of group.exercises) {
        if (enabled) {
          next.delete(ex.id);
        } else {
          next.add(ex.id);
        }
      }
      return next;
    });
  }, []);

  const groups = groupExercises(exercises);

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
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      {!loaded ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const enabledCount = group.exercises.filter((e) => !disabledIds.has(e.id)).length;
            const allEnabled = enabledCount === group.exercises.length;

            return (
              <Card key={group.label}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {group.label}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({enabledCount}/{group.exercises.length})
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`group-${group.label}`}
                        className="text-xs text-muted-foreground"
                      >
                        All
                      </Label>
                      <Switch
                        id={`group-${group.label}`}
                        checked={allEnabled}
                        onCheckedChange={(checked) => toggleGroup(group, checked)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between py-1">
                      <Label htmlFor={ex.id} className="text-sm font-normal">
                        {ex.name}
                      </Label>
                      <Switch
                        id={ex.id}
                        checked={!disabledIds.has(ex.id)}
                        onCheckedChange={(checked) => toggle(ex.id, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

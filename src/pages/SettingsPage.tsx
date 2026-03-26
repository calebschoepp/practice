import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FingeringDisplay } from "@/components/app/FingeringDisplay";
import { ROUTES } from "@/domain/routes";
import {
  groupExercises,
  exercisesForKey,
  keyToggleStatus,
  PIANO_KEYS,
  type ExerciseGroup,
} from "@/domain/exercises";
import type { Exercise, Instrument } from "@/domain/types";
import { ensureStorageBootstrapped, storageAdapter } from "@/storage";

function wouldLeaveEnabled(
  exercises: Exercise[],
  disabledIds: Set<string>,
  instrument: Instrument,
  pendingDisableIds: string[]
): number {
  const next = new Set(disabledIds);
  for (const id of pendingDisableIds) next.add(id);
  return exercises.filter((e) => e.instrument === instrument && !next.has(e.id)).length;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

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

  const toggle = useCallback(
    async (exerciseId: string, enabled: boolean) => {
      if (!enabled) {
        const ex = exercises.find((e) => e.id === exerciseId);
        if (ex && wouldLeaveEnabled(exercises, disabledIds, ex.instrument, [exerciseId]) < 1) {
          toast.error("At least one exercise must remain enabled");
          return;
        }
      }
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
    },
    [exercises, disabledIds]
  );

  const toggleGroup = useCallback(
    async (group: ExerciseGroup, enabled: boolean) => {
      if (!enabled) {
        const instrument = group.exercises[0]?.instrument;
        if (
          instrument &&
          wouldLeaveEnabled(
            exercises,
            disabledIds,
            instrument,
            group.exercises.map((e) => e.id)
          ) < 1
        ) {
          toast.error("At least one exercise must remain enabled");
          return;
        }
      }
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
    },
    [exercises, disabledIds]
  );

  const toggleKey = useCallback(
    async (slug: string, enabled: boolean) => {
      const keyExercises = exercisesForKey(exercises, slug);
      if (!enabled) {
        if (
          wouldLeaveEnabled(
            exercises,
            disabledIds,
            "piano",
            keyExercises.map((e) => e.id)
          ) < 1
        ) {
          toast.error("At least one exercise must remain enabled");
          return;
        }
      }
      for (const ex of keyExercises) {
        await storageAdapter.setExerciseEnabled(ex.id, enabled);
      }
      setDisabledIds((prev) => {
        const next = new Set(prev);
        for (const ex of keyExercises) {
          if (enabled) {
            next.delete(ex.id);
          } else {
            next.add(ex.id);
          }
        }
        return next;
      });
    },
    [exercises, disabledIds]
  );

  const pianoGroups = useMemo(() => groupExercises(exercises, "piano"), [exercises]);
  const guitarGroups = useMemo(() => groupExercises(exercises, "guitar"), [exercises]);

  const renderGroup = (group: ExerciseGroup) => {
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
              <Label htmlFor={`group-${group.label}`} className="text-xs text-muted-foreground">
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
              <button
                type="button"
                className="text-left text-sm font-normal underline-offset-2 hover:underline"
                onClick={() => setPreviewExercise(ex)}
              >
                {ex.name}
              </button>
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
  };

  const renderGroups = (groups: ExerciseGroup[]) => (
    <div className="space-y-4">{groups.map(renderGroup)}</div>
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-6">
      <header className="mb-2 flex items-center gap-2">
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

      <section className="mb-4">
        <h2 className="mb-1 text-lg font-semibold">Exercise Selection</h2>
        <p className="text-sm text-muted-foreground">
          Choose which exercises appear in your practice sessions.
        </p>
      </section>

      {!loaded ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <Tabs defaultValue="piano">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="piano" className="flex-1">
              Piano
            </TabsTrigger>
            <TabsTrigger value="guitar" className="flex-1">
              Guitar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="piano">
            <div className="mb-4 grid grid-cols-12 gap-1">
              {PIANO_KEYS.map((key) => {
                const status = keyToggleStatus(exercises, key.slug, disabledIds);

                return (
                  <button
                    key={key.slug}
                    type="button"
                    className={`rounded border py-1 text-center text-[10px] font-medium transition-colors ${
                      status === "all"
                        ? "border-primary bg-primary text-primary-foreground"
                        : status === "some"
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                    onClick={() => toggleKey(key.slug, status !== "all")}
                  >
                    {key.label}
                  </button>
                );
              })}
            </div>
            {renderGroups(pianoGroups)}
          </TabsContent>
          <TabsContent value="guitar">{renderGroups(guitarGroups)}</TabsContent>
        </Tabs>
      )}

      <Dialog
        open={previewExercise !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewExercise(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewExercise?.name}</DialogTitle>
          </DialogHeader>
          {previewExercise && <FingeringDisplay fingering={previewExercise.fingering} />}
        </DialogContent>
      </Dialog>
    </main>
  );
}

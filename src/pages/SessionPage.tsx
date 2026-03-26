import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, X } from "lucide-react";
import { DifficultyOverlay } from "@/components/app/DifficultyOverlay";
import { ExerciseHeader } from "@/components/app/ExerciseHeader";
import { FingeringDisplay } from "@/components/app/FingeringDisplay";
import { SessionProgressIndicator } from "@/components/app/SessionProgressIndicator";
import { TempoControl } from "@/components/app/TempoControl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/domain/routes";
import { useSessionStore } from "@/store/sessionStore";

export function SessionPage() {
  const navigate = useNavigate();
  const [showDifficulty, setShowDifficulty] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const {
    queue,
    queueIndex,
    completedCount,
    targetCount,
    muted,
    tempo,
    adjustTempo,
    toggleMuted,
    submitDifficulty,
    endSessionEarly,
  } = useSessionStore();

  const current = queue[queueIndex];

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (muted || !current) {
      clearTimer();
      return;
    }

    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextConstructor();
    }

    const context = audioContextRef.current;
    void context.resume();

    const playTick = () => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = 1200;
      gainNode.gain.setValueAtTime(0.0001, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.05);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.05);
    };

    playTick();
    const beatMs = Math.max(80, Math.round((60_000 / tempo) * 1));
    timerRef.current = window.setInterval(playTick, beatMs);

    return () => {
      clearTimer();
    };
  }, [tempo, muted, current]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") {
        toggleMuted();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggleMuted]);

  if (!current) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4">
        <p className="mb-4 text-muted-foreground">No active session.</p>
        <Button onClick={() => navigate(ROUTES.home)}>Back Home</Button>
      </main>
    );
  }

  const onDifficultySelected = async (difficulty: 0 | 1 | 2 | 3 | 4) => {
    const result = await submitDifficulty(difficulty);
    setShowDifficulty(false);
    if (result.ended) {
      navigate(ROUTES.home);
    }
  };

  const onCloseEarly = async () => {
    await endSessionEarly();
    navigate(ROUTES.home);
  };

  return (
    <main className="mx-auto flex h-dvh w-full max-w-xl flex-col px-4 py-4 overflow-hidden">
      <header className="mb-4 flex shrink-0 items-center justify-between">
        <SessionProgressIndicator completedCount={completedCount} targetCount={targetCount} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMuted}
            aria-label="Toggle mute"
            data-testid="mute-toggle"
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onCloseEarly}
            aria-label="Close session"
            data-testid="close-session"
          >
            <X />
          </Button>
        </div>
      </header>

      <Card className="min-h-0 flex-1">
        <CardContent className="flex h-full flex-col justify-between gap-4 pt-4">
          <ExerciseHeader
            exerciseName={current.exercise.name}
            variationName={current.variation.name}
          />
          <FingeringDisplay fingering={current.exercise.fingering} />
          <TempoControl
            tempo={tempo}
            onDecrease={() => adjustTempo(-2)}
            onIncrease={() => adjustTempo(2)}
          />
          <Button
            className="h-12 w-full"
            onClick={() => setShowDifficulty(true)}
            data-testid="done-button"
          >
            Done
          </Button>
        </CardContent>
      </Card>

      <DifficultyOverlay open={showDifficulty} onSelect={onDifficultySelected} />
    </main>
  );
}

import { useNavigate } from "react-router-dom";
import { Settings, BarChart3 } from "lucide-react";
import { InstrumentToggle } from "@/components/app/InstrumentToggle";
import { PracticeLengthSelector } from "@/components/app/PracticeLengthSelector";
import { RotatingCtaButton } from "@/components/app/RotatingCtaButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/domain/routes";
import { useSessionStore } from "@/store/sessionStore";

export function HomePage() {
  const navigate = useNavigate();
  const { instrument, length, setInstrument, setLength, startSession, isBusy } = useSessionStore();

  const handleStart = async () => {
    await startSession();
    const sessionId = useSessionStore.getState().sessionId;
    if (sessionId) {
      navigate(ROUTES.session);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Practice Tracker</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Stats"
            onClick={() => navigate(ROUTES.stats)}
          >
            <BarChart3 />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Settings"
            onClick={() => navigate(ROUTES.settings)}
          >
            <Settings />
          </Button>
        </div>
      </header>

      <Card className="border-amber-200 bg-amber-100 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Choose your session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-2">
            <p className="text-sm text-muted-foreground">Instrument</p>
            <InstrumentToggle value={instrument} onChange={setInstrument} />
          </section>

          <section className="space-y-2">
            <p className="text-sm text-muted-foreground">Duration</p>
            <PracticeLengthSelector value={length} onChange={setLength} />
          </section>

          <RotatingCtaButton onClick={handleStart} disabled={isBusy} />
        </CardContent>
      </Card>
    </main>
  );
}

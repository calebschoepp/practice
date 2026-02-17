import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { usePracticeStore, type PracticeUnit } from "@/store/practiceStore";

export function InstrumentPracticePage() {
  const { instrument } = useParams();
  const navigate = useNavigate();
  const { getPracticeUnits, updateLastTempo, incrementCount } = usePracticeStore();
  const practiceUnits = getPracticeUnits(instrument || "");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rating, setRating] = useState([2]); // Default to "okay" (index 2)
  const [currentUnit, setCurrentUnit] = useState<PracticeUnit | null>(null);
  const [remainingUnits, setRemainingUnits] = useState<PracticeUnit[]>([]);
  const initializedRef = useRef(false);

  const labels = ["terrible", "poorly", "okay", "well", "perfect"];

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp!;
    }
    return shuffled;
  };

  // Initialize practice session
  if (practiceUnits.length > 0 && !initializedRef.current) {
    const shuffled = shuffleArray(practiceUnits);
    setRemainingUnits(shuffled.slice(1));
    setCurrentUnit(shuffled[0] ?? null);
    initializedRef.current = true;
  }

  const handleNext = () => {
    if (!currentUnit || !instrument) return;

    // If rating is "perfect", increment tempo by 10 BPM up to target
    if (rating[0] === 4) {
      const newTempo = Math.min(currentUnit.lastTempo + 10, currentUnit.targetTempo);
      updateLastTempo(instrument, currentUnit.id, newTempo);
    }

    // Increment practice count
    incrementCount(instrument);

    // Get next unit or reshuffle
    if (remainingUnits.length > 0) {
      setCurrentUnit(remainingUnits[0] ?? null);
      setRemainingUnits(remainingUnits.slice(1));
    } else {
      // Reshuffle all units for next round
      const shuffled = shuffleArray(practiceUnits);
      setCurrentUnit(shuffled[0] ?? null);
      setRemainingUnits(shuffled.slice(1));
    }

    setRating([2]); // Reset rating to "okay"
    setIsDrawerOpen(false);
  };

  const handleEndSession = () => {
    navigate(-1); // Go back to previous page
  };

  if (practiceUnits.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 capitalize">Practice {instrument}</h2>
          <p className="text-muted-foreground mb-6 text-center">
            No practice units found. Add some in the edit page!
          </p>
          <Button onClick={() => navigate(`/instruments/${instrument}/edit`)}>
            Go to Edit Page
          </Button>
        </main>
      </div>
    );
  }

  if (!currentUnit) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{currentUnit.name}</h2>
        <div className="text-center space-y-2">
          <p className="text-lg md:text-xl text-muted-foreground">
            Target Tempo: <span className="font-semibold text-foreground">{currentUnit.targetTempo} BPM</span>
          </p>
          {currentUnit.lastTempo > 0 && (
            <p className="text-lg md:text-xl text-muted-foreground">
              Last Tempo: <span className="font-semibold text-foreground">{currentUnit.lastTempo} BPM</span>
            </p>
          )}
        </div>
      </main>
      <div className="mt-8 pb-8 space-y-3">
        <Button onClick={() => setIsDrawerOpen(true)} className="w-full">
          Next
        </Button>
        <Button onClick={handleEndSession} variant="outline" className="w-full">
          End Session
        </Button>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-2xl text-center">How well did you do?</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-6 space-y-6">
            <div className="space-y-4">
              <Slider
                value={rating}
                onValueChange={setRating}
                min={0}
                max={4}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground px-1">
                {labels.map((label, index) => (
                  <span
                    key={label}
                    className={`capitalize ${rating[0] === index ? "font-bold text-foreground" : ""}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleNext}>
              Next
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

import { useParams } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";

export function InstrumentPracticePage() {
  const { instrument } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rating, setRating] = useState([2]); // Default to "okay" (index 2)

  const labels = ["terrible", "poorly", "okay", "well", "perfect"];

  return (
    <div className="container mx-auto p-8 flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <h2 className="text-3xl font-bold mb-4 capitalize">Practice {instrument}</h2>
        <p className="text-muted-foreground">TODO: Add practice content here</p>
      </main>
      <div className="mt-8 pb-8">
        <Button onClick={() => setIsDrawerOpen(true)} className="w-full">
          Next
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
              <div className="flex justify-between text-sm text-muted-foreground">
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
            <Button className="w-full" onClick={() => setIsDrawerOpen(false)}>
              Next
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

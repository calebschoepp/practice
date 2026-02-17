import { useParams } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePracticeStore } from "@/store/practiceStore";
import { Trash2 } from "lucide-react";

export function InstrumentEditPage() {
  const { instrument } = useParams();
  const { getPracticeUnits, addPracticeUnit, deletePracticeUnit } = usePracticeStore();
  const practiceUnits = getPracticeUnits(instrument || "");

  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitTargetTempo, setNewUnitTargetTempo] = useState("");

  const handleAddUnit = () => {
    if (!instrument || !newUnitName.trim() || !newUnitTargetTempo) return;

    const targetTempo = parseInt(newUnitTargetTempo, 10);
    if (isNaN(targetTempo) || targetTempo <= 0) return;

    addPracticeUnit(instrument, {
      name: newUnitName.trim(),
      targetTempo,
      lastTempo: 0,
    });

    setNewUnitName("");
    setNewUnitTargetTempo("");
  };

  const handleDeleteUnit = (unitId: string) => {
    if (!instrument) return;
    deletePracticeUnit(instrument, unitId);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header />
      <main>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 capitalize">Edit {instrument}</h2>

        <Card className="mb-6 md:mb-8">
          <CardHeader>
            <CardTitle>Add Practice Unit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Name</Label>
              <Input
                id="unit-name"
                placeholder="e.g., D Major Scale"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-tempo">Target Tempo (BPM)</Label>
              <Input
                id="target-tempo"
                type="number"
                placeholder="e.g., 120"
                value={newUnitTargetTempo}
                onChange={(e) => setNewUnitTargetTempo(e.target.value)}
              />
            </div>
            <Button onClick={handleAddUnit} className="w-full">
              Add Unit
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3 md:space-y-4">
          <h3 className="text-lg md:text-xl font-semibold">Practice Units</h3>
          {practiceUnits.length === 0 ? (
            <p className="text-muted-foreground">No practice units yet. Add one above!</p>
          ) : (
            practiceUnits.map((unit) => (
              <Card key={unit.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{unit.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Target: {unit.targetTempo} BPM | Last: {unit.lastTempo} BPM
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUnit(unit.id)}
                    className="ml-2 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

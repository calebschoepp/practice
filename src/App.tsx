import "./index.css";
import { Card } from "@/components/ui/card";

export function App() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-4">Practice Better</h1>
      <p className="text-center text-muted-foreground mb-8">What are we practicing today?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-sm md:max-w-xl mx-auto">
        <Card className="cursor-pointer hover:bg-accent transition-colors aspect-square flex flex-col items-center justify-center p-6">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-8xl">🎹</div>
          </div>
          <div className="text-3xl font-semibold text-center">Piano</div>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors aspect-square flex flex-col items-center justify-center p-6">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-8xl">🎸</div>
          </div>
          <div className="text-3xl font-semibold text-center">Guitar</div>
        </Card>
      </div>
    </div>
  );
}

export default App;

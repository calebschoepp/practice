import { InstrumentCard } from "@/components/InstrumentCard";

export function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-4">Practice Better</h1>
      <p className="text-center text-muted-foreground mb-8">What are we practicing today?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-sm md:max-w-xl mx-auto">
        <InstrumentCard name="Piano" emoji="🎹" />
        <InstrumentCard name="Guitar" emoji="🎸" />
      </div>
    </div>
  );
}

import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";

export function InstrumentPracticePage() {
  const { instrument } = useParams();

  return (
    <div className="container mx-auto p-8">
      <Header />
      <main>
        <h2 className="text-3xl font-bold mb-4 capitalize">Practice {instrument}</h2>
        <p className="text-muted-foreground">TODO: Add practice content here</p>
      </main>
    </div>
  );
}

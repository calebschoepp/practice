import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";

export function InstrumentPage() {
  const { instrument } = useParams<{ instrument: string }>();

  return (
    <div className="container mx-auto p-8">
      <Header showBackButton />
      <h2 className="text-3xl font-semibold text-center mb-4 capitalize">{instrument}</h2>
      <p className="text-center text-muted-foreground">Practice page for {instrument}</p>
    </div>
  );
}

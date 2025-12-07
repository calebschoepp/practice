import { useParams, useNavigate } from "react-router-dom";

export function InstrumentPage() {
  const { instrument } = useParams<{ instrument: string }>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-8">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to instruments
      </button>
      <h1 className="text-4xl font-bold text-center mb-4 capitalize">{instrument}</h1>
      <p className="text-center text-muted-foreground">Practice page for {instrument}</p>
    </div>
  );
}

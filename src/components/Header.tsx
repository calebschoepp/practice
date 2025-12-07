import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showBackButton?: boolean;
}

export function Header({ showBackButton = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="mb-8">
      {showBackButton && (
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to instruments
        </button>
      )}
      <h1 className="text-4xl font-bold text-center">Practice Better</h1>
    </header>
  );
}

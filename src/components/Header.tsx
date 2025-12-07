import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="mb-8">
      <h1
        className="text-4xl font-bold text-center cursor-pointer hover:text-muted-foreground transition-colors"
        onClick={() => navigate("/")}
      >
        Practice Better
      </h1>
    </header>
  );
}

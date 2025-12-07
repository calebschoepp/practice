import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface InstrumentCardProps {
  name: string;
  emoji: string;
}

export function InstrumentCard({ name, emoji }: InstrumentCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/instruments/${name.toLowerCase()}`);
  };

  return (
    <Card
      className="cursor-pointer hover:bg-accent transition-colors aspect-square flex flex-col items-center justify-center p-6"
      onClick={handleClick}
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="text-8xl">{emoji}</div>
      </div>
      <div className="text-3xl font-semibold text-center">{name}</div>
    </Card>
  );
}

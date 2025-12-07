import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";

interface InstrumentCardProps {
  name: string;
  emoji: string;
}

export function InstrumentCard({ name, emoji }: InstrumentCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/instruments/${name.toLowerCase()}/practice`);
  };

  const handleGearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/instruments/${name.toLowerCase()}/edit`);
  };

  return (
    <Card
      className="cursor-pointer hover:bg-accent transition-colors aspect-square flex flex-col p-6 relative"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start absolute top-4 left-4 right-4">
        <div className="text-3xl font-semibold">{name}</div>
        <button
          onClick={handleGearClick}
          className="hover:bg-accent-foreground/10 rounded-full p-1 transition-colors shrink-0"
          aria-label="Edit instrument"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-8xl">{emoji}</div>
      </div>
    </Card>
  );
}

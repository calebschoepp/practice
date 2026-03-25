import { Button } from "@/components/ui/button";

interface RotatingCtaButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const MESSAGES = ["Start Session", "Let's Practice", "Lock In", "Build Momentum"];

export function RotatingCtaButton({ onClick, disabled }: RotatingCtaButtonProps) {
  const index = (() => {
    if (typeof window === "undefined") return 0;

    const currentSessionIndex = window.sessionStorage.getItem("practice-cta-index");
    if (currentSessionIndex !== null) {
      return Number(currentSessionIndex) % MESSAGES.length;
    }

    const persisted = Number(window.localStorage.getItem("practice-cta-seed") ?? "0");
    const next = (persisted + 1) % MESSAGES.length;
    window.localStorage.setItem("practice-cta-seed", String(next));
    window.sessionStorage.setItem("practice-cta-index", String(next));
    return next;
  })();

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="h-12 w-full text-base"
      data-testid="start-session"
    >
      {MESSAGES[index]}
    </Button>
  );
}

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/domain/routes";

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-6">
      <header className="mb-6 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ROUTES.home)}
          aria-label="Back home"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Shhh...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Secret setting coming soon. For now, your best performance tweak is one deep breath
            before each run.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

import "./index.css";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "@/pages/HomePage";
import { SessionPage } from "@/pages/SessionPage";
import { StatsPage } from "@/pages/StatsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ROUTES } from "@/domain/routes";
import { useSessionStore } from "@/store/sessionStore";

export function App() {
  const { bootstrap } = useSessionStore();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.session} element={<SessionPage />} />
      <Route path={ROUTES.stats} element={<StatsPage />} />
      <Route path={ROUTES.settings} element={<SettingsPage />} />
    </Routes>
  );
}

export default App;

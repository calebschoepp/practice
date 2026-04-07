import "./index.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "@/pages/HomePage";
import { SessionPage } from "@/pages/SessionPage";
import { StatsPage } from "@/pages/StatsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ROUTES } from "@/domain/routes";
import { useSessionStore } from "@/store/sessionStore";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  const { bootstrap } = useSessionStore();
  const location = useLocation();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const isScrollablePage =
      location.pathname === ROUTES.settings || location.pathname === ROUTES.stats;
    const shouldLock = !isScrollablePage;
    document.documentElement.classList.toggle("scroll-locked", shouldLock);
    document.body.classList.toggle("scroll-locked", shouldLock);
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.session} element={<SessionPage />} />
        <Route path={ROUTES.stats} element={<StatsPage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;

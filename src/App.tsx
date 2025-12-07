import "./index.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { InstrumentEditPage } from "@/pages/InstrumentEditPage";
import { InstrumentPracticePage } from "@/pages/InstrumentPracticePage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/instruments/:instrument/edit" element={<InstrumentEditPage />} />
      <Route path="/instruments/:instrument/practice" element={<InstrumentPracticePage />} />
    </Routes>
  );
}

export default App;

import "./index.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { InstrumentPage } from "@/pages/InstrumentPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/instruments/:instrument" element={<InstrumentPage />} />
    </Routes>
  );
}

export default App;

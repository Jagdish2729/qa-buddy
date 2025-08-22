// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Feature from "./pages/Feature.jsx";
import QA from "./pages/QA.jsx";
import PO from "./pages/PO.jsx"; 
import AllRounder from "./pages/AllRounder.jsx";
import ManualTestCases from "./pages/ManualTestCases";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Feature (QA/PO/Dev selection) */}
      <Route path="/feature" element={<Feature />} />

      {/* QA tool page (the one we just created) */}
      <Route path="/app" element={<QA />} />

      {/* PO page (your existing one) */}
      <Route path="/po" element={<PO />} />
      
      <Route path="/all-rounder" element={<AllRounder />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route path="/manual-test-cases" element={<ManualTestCases />} />
    </Routes>
  );
}

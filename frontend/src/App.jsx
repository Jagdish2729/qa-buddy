import { useEffect, useState } from "react";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import "./App.css";
import Home from "./pages/Home";
import ComingSoon from "./pages/Comingsoon";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import { isLoggedIn, logout } from "./utils/auth";

function App() {
  useEffect(() => {
    document.title = "QA Buddy Helper";
  }, []);

  // ---- STATE (your existing) ----
  const [jiraText, setJiraText] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loadingMode, setLoadingMode] = useState(null); // 'manual' | 'automation' | 'gherkin' | 'java' | 'appium'
  const [ticketId, setTicketId] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);

  // ---- HANDLERS (your existing) ----
  const handleSubmit = async (mode) => {
    setLoadingMode(mode);
    setError("");
    setSelectedMode(mode);
    setResponse("");

    try {
      const res = await axios.post("http://localhost:3000/generate", {
        jiraText,
        mode,
      });
      setResponse(res.data.result);
    } catch (err) {
      setError("❌ Error generating test cases. Check server.");
      console.error("❌ Axios error:", err);
    } finally {
      setLoadingMode(null);
    }
  };

  const handleFetchJira = async () => {
    try {
      const res = await axios.post("http://localhost:3000/jira-ticket", {
        ticketId: ticketId,
      });
    setJiraText(res.data.jiraText);
      setError("");
    } catch (err) {
      setError("❌ Failed to fetch JIRA ticket.");
      console.error("❌ JIRA fetch error", err);
    }
  };

  const handleDownloadCSV = () => {
    const rows = response
      .split("\n")
      .map((line) => line.split("|").map((cell) => cell.trim()));

    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "test_cases.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---- PROTECTED ROUTE ----
  function ProtectedRoute({ children }) {
    if (!isLoggedIn()) return <Navigate to="/auth" replace />;
    return children;
  }

  // ---- MAIN UI (your existing UI + Logout button) ----
  const MainUI = () => (
    <Container className={`mt-5 ${darkMode ? "dark-mode" : ""}`}>
      <div className="qa-section">
        <div className="qa-links">
          <a href="https://www.guru99.com/manual-testing.html" target="_blank" rel="noopener noreferrer">Manual</a>
          <a href="https://playwright.dev/docs/intro" target="_blank" rel="noopener noreferrer">Playwright</a>
          <a href="https://www.postman.com/api-platform" target="_blank" rel="noopener noreferrer">API</a>
          <a href="https://www.w3schools.com/sql/" target="_blank" rel="noopener noreferrer">SQL</a>
          <a href="https://testautomationu.applitools.com/" target="_blank" rel="noopener noreferrer">Tools</a>
        </div>
      </div>

      {/* Dark Mode + Logout */}
      <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
        <Form.Check
          type="switch"
          id="dark-mode-switch"
          label={darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
        <Button
          size="sm"
          variant="outline-danger"
          onClick={() => { logout(); window.location.href = "/auth"; }}
        >
          Logout
        </Button>
      </div>

      <h2 className="mb-4 text-center">QA-Buddy-Jojo</h2>

      {/* 🎟️ JIRA Ticket Fetch */}
      <Form.Group className="mb-3">
        <Form.Label>🎟️ Enter JIRA Ticket ID</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="e.g. SCRUM-1"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
          <Button variant="warning" onClick={handleFetchJira} disabled={loadingMode !== null}>
            Fetch from JIRA
          </Button>
        </div>
      </Form.Group>

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>📝 JIRA Acceptance Criteria</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={jiraText}
            onChange={(e) => setJiraText(e.target.value)}
            placeholder="e.g. Given I am on the login page..."
          />
        </Form.Group>

        <div className="d-flex justify-content-center gap-3">
          <Button variant="primary" onClick={() => handleSubmit("manual")} disabled={loadingMode !== null}>
            {loadingMode === "manual" ? (<><Spinner as="span" animation="border" size="sm" /> Generating...</>) : "Generate Manual Test Cases"}
          </Button>

          <Button variant="success" onClick={() => handleSubmit("automation")} disabled={loadingMode !== null}>
            {loadingMode === "automation" ? (<><Spinner as="span" animation="border" size="sm" /> Generating...</>) : "Generate Playwright Script"}
          </Button>

          <Button variant="warning" onClick={() => handleSubmit("gherkin")} disabled={loadingMode !== null}>
            {loadingMode === "gherkin" ? (<><Spinner as="span" animation="border" size="sm" /> Generating...</>) : "Generate Gherkin Test Cases"}
          </Button>

          <Button variant="dark" onClick={() => handleSubmit("java")} disabled={loadingMode !== null}>
            {loadingMode === "java" ? (<><Spinner as="span" animation="border" size="sm" /> Generating...</>) : "Generate Java Selenium Script"}
          </Button>

          <Button variant="dark" onClick={() => handleSubmit("appium")} disabled={loadingMode !== null}>
            {loadingMode === "appium" ? (<><Spinner as="span" animation="border" size="sm" /> Generating...</>) : "Generate Appium Code"}
          </Button>
        </div>
      </Form>

      {error && <Alert variant="danger" className="mt-4">{error}</Alert>}

      {response && (
        <>
          <div className="result-box mt-4">
            <pre><code>{response}</code></pre>
          </div>
          {selectedMode === "manual" && (
            <div className="d-flex justify-content-center mt-3">
              <Button variant="info" onClick={handleDownloadCSV}>📥 Export to CSV</Button>
            </div>
          )}
        </>
      )}
    </Container>
  );

  // ---- ROUTES ----
  return (
  <Routes>
    {/* Always land on login */}
    <Route path="/" element={<Navigate to="/auth" replace />} />

    {/* Auth page (open) */}
    <Route path="/auth" element={<Auth />} />

    {/* Home (roles) - Protected */}
    <Route
      path="/home"
      element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      }
    />

    {/* QA Buddy - Protected */}
    <Route
      path="/app"
      element={
        <ProtectedRoute>
          <MainUI />
        </ProtectedRoute>
      }
    />

    {/* Coming soon - Protected */}
    <Route
      path="/coming-soon"
      element={
        <ProtectedRoute>
          <ComingSoon />
        </ProtectedRoute>
      }
    />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/auth" replace />} />
  </Routes>
);

}

export default App;

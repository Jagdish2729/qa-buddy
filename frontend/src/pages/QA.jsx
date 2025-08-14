import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import AppNavbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function QA() {

  useEffect(() => { document.title = "AgileGenieAI"; }, []);

  // state
  const [ticketId, setTicketId] = useState("");
  const [jiraText, setJiraText] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loadingMode, setLoadingMode] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [files, setFiles] = useState([]);

  // NEW: copy button label state
  const [copyLabel, setCopyLabel] = useState("Copy");

  // theme tokens
  const brand = { bg: "#E6F6FF", ink: "#0B4A6E", sub: "#2B6C8C", primary: "#2B7DEA", chip: "#8FD3FF" };

  // handlers
  const callGenerate = async (mode) => {
    setLoadingMode(mode);
    setSelectedMode(mode);
    setError("");
    setResponse("");

    try {
      // Build multipart body
      const fd = new FormData();
      fd.append("mode", mode);
      fd.append("ticketId", ticketId);   // optional: if backend needs it
      fd.append("jiraText", jiraText || "");

      // Append all selected files
      files.forEach((f) => {
        fd.append("files", f, f.name); // 'files' should match backend field name
      });

      const { data } = await axios.post(`${API}/generate`, fd, {
        headers: { /* axios will set multipart boundary automatically */ },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / (e.total || 1));
          console.log("upload %", pct);
        },
      });

      setResponse(data?.result || "");
      // reset copy label when new response arrives
      setCopyLabel("Copy");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "❌ Error generating output. Please check server.");
    } finally {
      setLoadingMode(null);
    }
  };

  const handleFetchJira = async () => {
    setError("");
    try {
      const { data } = await axios.post(`${API}/jira-ticket`, { ticketId });
      setJiraText(data?.jiraText || "");
    } catch (e) {
      console.error(e);
      setError("❌ Failed to fetch JIRA ticket.");
    }
  };

  // UPDATED: Copy with label flip to "Copied!" then back
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response || "");
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy"), 2000);
    } catch {
      // ignore
    }
  };

  const handleExportCSV = () => {
    const rows = (response || "")
      .split("\n")
      .map((line) => line.split("|").map((cell) => cell.trim()));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "test_cases.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
  };

  return (
    <div style={{ background: brand.bg, minHeight: "100vh" }}>
      <AppNavbar />

      <Container className="py-4 py-md-5">
        {/* Title */}
        <Row>
          <Col>
            <h1 style={{ fontWeight: 800, color: brand.ink, lineHeight: 1.1, fontSize: "clamp(26px,4.5vw,42px)" }}>
              QA Buddy – Role Workspace
            </h1>
            <p style={{ color: brand.sub, marginTop: 6 }}>
              Generate test cases, automation scripts & assets with a guided flow.
            </p>
          </Col>
        </Row>

        {/* Two columns: Inputs/Actions (left) — Output (right) */}
        <Row className="g-4 mt-1">
          {/* LEFT: Inputs + Actions */}
          <Col lg={8}>
            {/* Inputs */}
            <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: 16 }}>
              <Card.Body>
                <h5 style={{ color: brand.ink, fontWeight: 800, marginBottom: 12 }}>Inputs</h5>

                {/* JIRA Ticket */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>
                    🎟️ Enter JIRA Ticket ID
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      placeholder="e.g. SCRUM-1"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="warning"
                      style={{ borderRadius: 12, fontWeight: 700 }}
                      onClick={handleFetchJira}
                      disabled={loadingMode !== null}
                    >
                      Fetch from JIRA
                    </Button>
                  </div>
                </Form.Group>

                {/* Acceptance Criteria */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>
                    📝 JIRA Acceptance Criteria
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    placeholder="e.g. Given I am on the login page..."
                    value={jiraText}
                    onChange={(e) => setJiraText(e.target.value)}
                  />
                </Form.Group>

                {/* Upload Screenshot/Figma (small button) */}
                <Form.Group>
                  <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>
                    🖼️ Upload Screenshot / Figma (optional)
                  </Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.pdf,.fig"
                      onChange={handleFilePick}
                      style={{ maxWidth: 320 }}
                    />
                    {files.length > 0 && (
                      <small style={{ color: brand.sub }}>{files.length} file(s) selected</small>
                    )}
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Generate Buttons */}
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <Card.Body>
                <h5 style={{ color: brand.ink, fontWeight: 800, marginBottom: 12 }}>Generate</h5>
                <div className="d-flex flex-wrap gap-3">
                  <Button
                    type="button"
                    style={{ background: brand.primary, borderColor: brand.primary, borderRadius: 12, fontWeight: 700 }}
                    onClick={() => callGenerate("manual")}
                    disabled={loadingMode !== null}
                  >
                    {loadingMode === "manual" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Manual Test Cases"}
                  </Button>

                  <Button
                    type="button"
                    variant="success"
                    style={{ borderRadius: 12, fontWeight: 700 }}
                    onClick={() => callGenerate("automation")}
                    disabled={loadingMode !== null}
                  >
                    {loadingMode === "automation" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Playwright Script"}
                  </Button>

                  <Button
                    type="button"
                    variant="warning"
                    style={{ borderRadius: 12, fontWeight: 700 }}
                    onClick={() => callGenerate("gherkin")}
                    disabled={loadingMode !== null}
                  >
                    {loadingMode === "gherkin" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Gherkin Test Cases"}
                  </Button>

                  <Button
                    type="button"
                    variant="dark"
                    style={{ borderRadius: 12, fontWeight: 700 }}
                    onClick={() => callGenerate("java")}
                    disabled={loadingMode !== null}
                  >
                    {loadingMode === "java" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Java Selenium Script"}
                  </Button>

                  <Button
                    type="button"
                    variant="dark"
                    style={{ borderRadius: 12, fontWeight: 700 }}
                    onClick={() => callGenerate("appium")}
                    disabled={loadingMode !== null}
                  >
                    {loadingMode === "appium" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Appium Code"}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Errors below actions (if any) */}
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Col>

          {/* RIGHT: Output panel */}
          <Col lg={4}>
            <Card className="shadow-sm border-0 sticky-top" style={{ borderRadius: 16, top: 90 }}>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 style={{ color: brand.ink, fontWeight: 800, marginBottom: 0 }}>Output</h5>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      style={{ background: brand.primary, borderColor: brand.primary, borderRadius: 10 }}
                      onClick={handleExportCSV}
                      disabled={!response}
                    >
                      Export CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      style={{ borderRadius: 10 }}
                      onClick={handleCopy}
                      disabled={!response}
                    >
                      {copyLabel}
                    </Button>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    background: "#F9FBFF",
                    border: "1px solid #DCEBFA",
                    borderRadius: 12,
                    padding: 12,
                    maxHeight: 450,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    color: brand.sub,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    fontSize: 14,
                  }}
                >
                  {response || "Results will appear here after you generate."}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

// src/pages/AllRounder.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import AppNavbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function AllRounder() {
  useEffect(() => { document.title = "All Rounder | AgileGenieAI"; }, []);

  // theme
  const brand = { bg: "#E6F6FF", ink: "#0B4A6E", sub: "#2B6C8C", primary: "#2B7DEA" };

  // ===== PO flow: one-liner -> story + AC
  const [oneLiner, setOneLiner] = useState("");
  const [output, setOutput] = useState("");            // readonly text
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Jira creation inputs
  const [projectKey, setProjectKey] = useState("SCRUM"); // default SCRUM
  const [issueType, setIssueType] = useState("Story");   // Story | Task
  const [summary, setSummary] = useState("");            // REQUIRED
  const [reporterEmail, setReporterEmail] = useState(""); // optional if accountId provided
  const [reporterAccountId, setReporterAccountId] = useState(""); // optional (preferred if provided)

  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState("");

  // Edit fields
  const [editStory, setEditStory] = useState(""); // user story line only
  const [acText, setAcText] = useState("");       // one AC per line

  // Generate via /po/generate-ac
  const handleGenerate = async () => {
    if (!oneLiner.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/po/generate-ac`, { oneLiner });
      const raw = data?.result || "";

      const lines = raw.split("\n");
      const usLine = lines.find((l) => l.toLowerCase().startsWith("user story"));
      const acStart = lines.findIndex((l) => l.toLowerCase().includes("acceptance criteria"));
      const bullets = acStart >= 0 ? lines.slice(acStart + 1).filter((l) => l.trim()) : [];

      const cleanStory = usLine ? usLine.replace(/^User Story:\s*/i, "").trim() : raw.trim();
      const cleanAc = bullets
        .map((l) => l.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean)
        .join("\n");

      setOutput(raw.trim());
      setEditStory(cleanStory || "");
      setAcText(cleanAc || "");
      setIsEditing(false);

      // Prefill summary from story (user can override)
      setSummary(cleanStory || "");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to generate User Story & AC");
    } finally {
      setLoading(false);
    }
  };

  const composeFromEdits = (s, ac) => {
    const acLines = (ac || "").split("\n").map((x) => x.trim()).filter(Boolean);
    return `User Story:
${(s || "").trim()}

Acceptance Criteria:
- ${acLines.join("\n- ")}`.trim();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? composeFromEdits(editStory, acText) : (output || ""));
    } catch {}
  };

  const handleSaveEdits = () => {
    const edited = composeFromEdits(editStory, acText);
    setOutput(edited);
    // keep summary unchanged unless user wants to change it explicitly
    setIsEditing(false);
  };

  // Extract story + AC lines for Jira
  const getCurrentStoryAndAC = () => {
    if (isEditing) {
      const acLines = (acText || "").split("\n").map((s) => s.trim()).filter(Boolean);
      return { s: (editStory || "").trim(), acLines };
    }
    const text = (output || "");
    const lines = text.split("\n");
    const usLine = lines.find((l) => /^User Story/i.test(l));
    const s = usLine ? usLine.replace(/^User Story:\s*/i, "").trim() : text.trim();

    const acStart = lines.findIndex((l) => /Acceptance Criteria/i.test(l));
    const bullets = acStart >= 0 ? lines.slice(acStart + 1) : [];
    const acLines = bullets.map((l) => l.replace(/^[-*]\s*/, "").trim()).filter(Boolean);

    return { s, acLines };
  };

  // ===== Embedded QA panel state
  const [ticketId, setTicketId] = useState("");
  const [jiraText, setJiraText] = useState("");
  const [qaError, setQaError] = useState("");
  const [qaResponse, setQaResponse] = useState("");
  const [qaLoadingMode, setQaLoadingMode] = useState(null);
  const [files, setFiles] = useState([]);
  const [copyLabel, setCopyLabel] = useState("Copy");

  const handleFetchJira = async () => {
    setQaError("");
    try {
      const { data } = await axios.post(`${API}/jira-ticket`, { ticketId });
      setJiraText(data?.jiraText || "");
    } catch (e) {
      console.error(e);
      setQaError("❌ Failed to fetch JIRA ticket.");
    }
  };

  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
  };

  const callGenerate = async (mode) => {
    setQaLoadingMode(mode);
    setQaError("");
    setQaResponse("");
    try {
      const fd = new FormData();
      fd.append("mode", mode);
      fd.append("ticketId", ticketId);
      fd.append("jiraText", jiraText || "");
      files.forEach((f) => fd.append("files", f, f.name));

      const { data } = await axios.post(`${API}/generate`, fd);
      setQaResponse(data?.result || "");
      setCopyLabel("Copy");
    } catch (e) {
      console.error(e);
      setQaError(e?.response?.data?.message || "❌ Error generating output. Please check server.");
    } finally {
      setQaLoadingMode(null);
    }
  };

  const handleExportCSV = () => {
    const rows = (qaResponse || "")
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

  const handleCopyQa = async () => {
    try {
      await navigator.clipboard.writeText(qaResponse || "");
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy"), 2000);
    } catch {}
  };

  // ===== Create Jira Ticket
  const handleCreateJira = async () => {
    const { s, acLines } = getCurrentStoryAndAC();
    const descFull = isEditing ? composeFromEdits(editStory, acText) : output;

    if (!s) return alert("User Story missing. Please generate or edit first.");
    if (!summary.trim()) return alert("Summary is required.");
    if (!projectKey.trim()) return alert("Project key is required.");

    setCreating(true);
    setCreatedKey("");
    try {
      const { data } = await axios.post(`${API}/jira/create`, {
        projectKey,
        issueType,
        summary: summary.trim(),              // user-provided summary
        description: descFull || s,           // full formatted description (story + AC)
        acceptanceCriteria: acLines,          // also pass AC as bullets (backend will merge to ADF)
        reporterEmail: reporterEmail.trim() || undefined,
        reporterAccountId: reporterAccountId.trim() || undefined,
      });

      setCreatedKey(data?.issueKey || "");
      setTicketId(data?.issueKey || ""); // prefill QA panel
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to create Jira ticket.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ background: brand.bg, minHeight: "100vh" }}>
      <AppNavbar />
      <Container className="py-4 py-md-5">
        {/* Title */}
        <Row className="mb-3">
          <Col>
            <h1 style={{ fontWeight: 800, color: brand.ink, lineHeight: 1.1, fontSize: "clamp(26px,4.5vw,42px)" }}>
              All Rounder
            </h1>
            <p style={{ color: brand.sub, marginTop: 6 }}>
              One flow: write a one-liner → get User Story & AC → edit → create Jira → generate tests/code.
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {/* LEFT: One-liner input */}
          <Col lg={6}>
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <Card.Body>
                <h5 style={{ color: brand.ink, fontWeight: 800, marginBottom: 12 }}>Write your one-liner</h5>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="e.g. Allow users to reset password via email link"
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                />
                <div className="d-flex gap-2 mt-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={!oneLiner.trim() || loading}
                    style={{ background: brand.primary, borderColor: brand.primary, borderRadius: 12, fontWeight: 700 }}
                  >
                    {loading ? "Generating…" : "Generate User Story & AC"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT: Output / Edit + Create Jira controls */}
          <Col lg={6}>
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 style={{ color: brand.ink, fontWeight: 800, marginBottom: 0 }}>Output</h5>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="secondary" onClick={handleCopy} disabled={!output && !isEditing}>
                      Copy
                    </Button>
                    {!isEditing ? (
                      <Button size="sm" onClick={() => setIsEditing(true)} disabled={!output}>
                        Edit
                      </Button>
                    ) : (
                      <Button size="sm" variant="success" onClick={handleSaveEdits}>
                        Save
                      </Button>
                    )}
                  </div>
                </div>

                {/* Jira creation controls */}
                <div className="mt-3 d-grid gap-2" style={{ gridTemplateColumns: "1fr 1fr", display: "grid" }}>
                  <Form.Group>
                    <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>Project</Form.Label>
                    <Form.Control
                      placeholder="e.g. SCRUM"
                      value={projectKey}
                      onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>Issue Type</Form.Label>
                    <Form.Select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                      <option>Story</option>
                      <option>Task</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="col-span-2">
                    <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>Summary (required)</Form.Label>
                    <Form.Control
                      placeholder="e.g. Reset password via email link"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>Reporter Email</Form.Label>
                    <Form.Control
                      placeholder="name@company.com"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>Reporter Account ID (optional)</Form.Label>
                    <Form.Control
                      placeholder="If known — overrides email lookup"
                      value={reporterAccountId}
                      onChange={(e) => setReporterAccountId(e.target.value)}
                    />
                  </Form.Group>

                  <div className="col-span-2 d-flex justify-content-end">
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={handleCreateJira}
                      disabled={creating || (!output && !isEditing) || !summary.trim() || !projectKey.trim()}
                    >
                      {creating ? "Creating..." : "Create Jira Ticket"}
                    </Button>
                  </div>
                </div>

                {/* Success banner */}
                {createdKey && (
                  <Alert variant="success" className="mt-3">
                    Created: <b>{createdKey}</b>{" "}
                    <a
                      href={`${import.meta.env.VITE_JIRA_BASE || ""}/browse/${createdKey}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Jira
                    </a>
                  </Alert>
                )}

                {/* Readonly view */}
                {!isEditing && (
                  <pre
                    style={{
                      marginTop: 12,
                      background: "#F9FBFF",
                      border: "1px solid #DCEBFA",
                      borderRadius: 12,
                      padding: 12,
                      minHeight: 220,
                      whiteSpace: "pre-wrap",
                      color: brand.sub,
                    }}
                  >
                    {output || "Your user story & AC will appear here after generation."}
                  </pre>
                )}

                {/* Edit mode */}
                {isEditing && (
                  <div style={{ marginTop: 12 }}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>User Story</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editStory}
                        onChange={(e) => setEditStory(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>
                        Acceptance Criteria (one per line)
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        value={acText}
                        onChange={(e) => setAcText(e.target.value)}
                      />
                    </Form.Group>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Embedded QA Panel (shown after ticket created) */}
        {createdKey && (
          <Row className="g-4 mt-4">
            <Col lg={8}>
              <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: 16 }}>
                <Card.Body>
                  <h5 style={{ color: brand.ink, fontWeight: 800, marginBottom: 12 }}>QA Panel</h5>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: brand.ink, fontWeight: 700 }}>
                      🎟️ JIRA Ticket ID
                    </Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        placeholder="e.g. SCRUM-123"
                        value={ticketId}
                        onChange={(e) => setTicketId(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="warning"
                        style={{ borderRadius: 12, fontWeight: 700 }}
                        onClick={handleFetchJira}
                        disabled={qaLoadingMode !== null}
                      >
                        Fetch from JIRA
                      </Button>
                    </div>
                  </Form.Group>

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

              <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
                <Card.Body>
                  <h5 style={{ color: brand.ink, fontWeight: 800, marginBottom: 12 }}>Generate</h5>
                  <div className="d-flex flex-wrap gap-3">
                    <Button
                      type="button"
                      style={{ background: brand.primary, borderColor: brand.primary, borderRadius: 12, fontWeight: 700 }}
                      onClick={() => callGenerate("manual")}
                      disabled={qaLoadingMode !== null}
                    >
                      {qaLoadingMode === "manual" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Manual Test Cases"}
                    </Button>

                    <Button
                      type="button"
                      variant="success"
                      style={{ borderRadius: 12, fontWeight: 700 }}
                      onClick={() => callGenerate("automation")}
                      disabled={qaLoadingMode !== null}
                    >
                      {qaLoadingMode === "automation" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Playwright Script"}
                    </Button>

                    <Button
                      type="button"
                      variant="warning"
                      style={{ borderRadius: 12, fontWeight: 700 }}
                      onClick={() => callGenerate("gherkin")}
                      disabled={qaLoadingMode !== null}
                    >
                      {qaLoadingMode === "gherkin" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Gherkin Test Cases"}
                    </Button>

                    <Button
                      type="button"
                      variant="dark"
                      style={{ borderRadius: 12, fontWeight: 700 }}
                      onClick={() => callGenerate("java")}
                      disabled={qaLoadingMode !== null}
                    >
                      {qaLoadingMode === "java" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Java Selenium Script"}
                    </Button>

                    <Button
                      type="button"
                      variant="dark"
                      style={{ borderRadius: 12, fontWeight: 700 }}
                      onClick={() => callGenerate("appium")}
                      disabled={qaLoadingMode !== null}
                    >
                      {qaLoadingMode === "appium" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Appium Code"}
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {qaError && <Alert variant="danger" className="mt-3">{qaError}</Alert>}
            </Col>

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
                        disabled={!qaResponse}
                      >
                        Export CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="info"
                        style={{ borderRadius: 10 }}
                        onClick={handleCopyQa}
                        disabled={!qaResponse}
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
                    {qaResponse || "Results will appear here after you generate."}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

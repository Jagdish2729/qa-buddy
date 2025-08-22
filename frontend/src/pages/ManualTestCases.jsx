// src/pages/ManualTestCases.jsx
import { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from "react-bootstrap";
import axios from "axios";
import AppNavbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function ManualTestCases() {
  useEffect(() => { document.title = "Manual Test Cases – QA Buddy"; }, []);
  const brand = { bg:"#E6F6FF", ink:"#0B4A6E", sub:"#2B6C8C", primary:"#2B7DEA" };

  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [loadingMode, setLoadingMode] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy");

  const pickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
    setError("");
  };

  const clearFiles = () => {
    setFiles([]);
    // reset the hidden input so selecting same file again also triggers change
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const callGenerate = async (mode) => {
    try {
      if (!files.length) {
        setError("Please upload at least one manual test file (CSV/XLSX/JSON/MD/TXT).");
        return;
      }
      setLoadingMode(mode);
      setError(""); 
      setResult("");

      const fd = new FormData();
      fd.append("mode", mode);
      fd.append("source", "manual");
      files.forEach((f) => fd.append("manualFiles", f, f.name));

      const { data } = await axios.post(`${API}/manual/generate`, fd);
      setResult(data?.result || "");
      setCopyLabel("Copy");
    } catch (e) {
      setError(e?.response?.data?.message || "Generation failed");
    } finally {
      setLoadingMode(null);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy"), 2000);
  };

  return (
    <div style={{ background: brand.bg, minHeight: "100vh" }}>
      <AppNavbar />
      <Container className="py-5">
        <Row className="align-items-center mb-3">
          <Col>
            <h1 style={{ fontWeight: 800, color: brand.ink }}>Manual Test Cases</h1>
            <p style={{ color: brand.sub }}>
              If you already have manual test cases, click the button to upload them. We’ll convert them into automation.
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={8}>
            {/* Upload card */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <Card.Body>
                <h5 style={{ color: brand.ink, fontWeight: 800 }}>Upload</h5>
                <p style={{ color: brand.sub, marginTop: 6 }}>
                  Supported: <strong>CSV, XLSX, JSON, MD, TXT</strong> (you can also attach screenshots/PDFs if needed).
                </p>

                {/* Hidden native input */}
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.json,.md,.txt,.png,.jpg,.jpeg,.pdf,.fig"
                  onChange={pickFiles}
                  style={{ display: "none" }}
                />

                <div className="d-flex gap-2 flex-wrap">
                  <Button
                    style={{ background: brand.primary, borderColor: brand.primary, borderRadius: 12, fontWeight: 700 }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload files
                  </Button>
                  <Button variant="outline-secondary" style={{ borderRadius: 12, fontWeight: 700 }} onClick={clearFiles}>
                    Clear
                  </Button>
                </div>

                {/* Selected files */}
                {!!files.length && (
                  <div className="mt-2 d-flex gap-2 flex-wrap">
                    {files.map((f) => (
                      <Badge key={f.name} bg="light" text="dark" className="border">
                        {f.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Generate card */}
            <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: 16 }}>
              <Card.Body>
                <h5 style={{ color: brand.ink, fontWeight: 800 }}>Generate</h5>
                <div className="d-flex flex-wrap gap-3">
                  <Button
                    style={{ background: brand.primary, borderColor: brand.primary, borderRadius: 12, fontWeight: 700 }}
                    disabled={loadingMode!==null}
                    onClick={() => callGenerate("playwright")}
                  >
                    {loadingMode==="playwright" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Playwright"}
                  </Button>

                  <Button
                    variant="dark"
                    style={{ borderRadius: 12, fontWeight: 700 }}
                    disabled={loadingMode!==null}
                    onClick={() => callGenerate("java")}
                  >
                    {loadingMode==="java" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Java Selenium"}
                  </Button>

                  <Button
                    variant="secondary"
                    style={{ borderRadius: 12, fontWeight: 700 }}
                    disabled={loadingMode!==null}
                    onClick={() => callGenerate("appium")}
                  >
                    {loadingMode==="appium" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Appium"}
                  </Button>

                  {/* Uncomment when needed
                  <Button
                    variant="warning"
                    style={{ borderRadius: 12, fontWeight: 700 }}
                    disabled={loadingMode!==null}
                    onClick={() => callGenerate("gherkin")}
                  >
                    {loadingMode==="gherkin" ? <><Spinner size="sm" animation="border" /> Generating…</> : "Generate Gherkin"}
                  </Button>
                  */}
                </div>
              </Card.Body>
            </Card>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Col>

          {/* Output panel */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ borderRadius: 16, top: 90 }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 style={{ color: brand.ink, fontWeight: 800, margin: 0 }}>Output</h5>
                  <Button size="sm" variant="info" onClick={handleCopy} disabled={!result}>{copyLabel}</Button>
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
                    fontFamily: "ui-monospace, Menlo, Consolas, monospace",
                    fontSize: 14,
                  }}
                >
                  {result || "Results will appear here."}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

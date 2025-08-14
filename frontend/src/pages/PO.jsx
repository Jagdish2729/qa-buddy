import { useState } from "react";
import { Container, Card, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from "axios";

// .env: VITE_API_BASE = http://localhost:3000 (ya jo bhi)
const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function PO() {
  const [oneLiner, setOneLiner] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  const brand = { bg: "#E6F6FF", ink: "#0B4A6E", sub: "#2B6C8C" };

  const callApi = async (url, payload, action) => {
    setLoading(action);
    setError("");
    setResult("");
    try {
      const { data } = await axios.post(url, payload);
      setResult(data?.result || "Done ✅");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateAC = () => {
    if (!oneLiner.trim()) {
      setError("Please enter a one-liner first.");
      return;
    }
    callApi(`${API}/po/generate-ac`, { oneLiner }, "ac");
  };

  const handleGrooming = () => callApi(`${API}/po/grooming`, {}, "grooming");
  const handlePlanning = () => callApi(`${API}/po/planning`, {}, "planning");
  const handleRetro = () => callApi(`${API}/po/retro`, {}, "retro");
  const handleCapacity = () => callApi(`${API}/po/capacity`, {}, "capacity");

  return (
    <div style={{ background: brand.bg, minHeight: "100vh" }}>
      <Container className="py-4 py-md-5">
        <h3 className="mb-3" style={{ color: brand.ink, fontWeight: 800 }}>
          📋 Product Owner Workspace
        </h3>

        <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: 14 }}>
          <Card.Body>
            <h5 style={{ color: brand.ink, fontWeight: 700 }}>
              Write complete AC & Description from a single line
            </h5>
            <Form.Control
              className="my-2"
              placeholder="e.g. Allow users to reset password via forgot link"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleGenerateAC}
              disabled={loading !== null}
              style={{ background: "#2B7DEA", borderColor: "#2B7DEA", borderRadius: 12, fontWeight: 700 }}
            >
              {loading === "ac" ? <Spinner size="sm" animation="border" /> : "Generate AC & Description"}
            </Button>
          </Card.Body>
        </Card>

        <Row className="g-3">
          <Col md={6}>
            <Card className="shadow-sm border-0" style={{ borderRadius: 14 }}>
              <Card.Body>
                <h5 style={{ color: brand.ink, fontWeight: 700 }}>Team Grooming (emails + AI board)</h5>
                <p className="text-muted small mb-3" style={{ color: brand.sub }}>
                  Creates agenda, assigns owners, sends mail (stub), and drafts a grooming board.
                </p>
                <Button
                  type="button"
                  variant="warning"
                  onClick={handleGrooming}
                  disabled={loading !== null}
                  style={{ borderRadius: 12, fontWeight: 700 }}
                >
                  {loading === "grooming" ? <Spinner size="sm" animation="border" /> : "Create Grooming Plan"}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow-sm border-0" style={{ borderRadius: 14 }}>
              <Card.Body>
                <h5 style={{ color: brand.ink, fontWeight: 700 }}>Team Planning (emails + AI board)</h5>
                <p className="text-muted small mb-3" style={{ color: brand.sub }}>
                  Drafts sprint goals, backlog order, capacity hints; sends mail (stub).
                </p>
                <Button
                  type="button"
                  variant="success"
                  onClick={handlePlanning}
                  disabled={loading !== null}
                  style={{ borderRadius: 12, fontWeight: 700 }}
                >
                  {loading === "planning" ? <Spinner size="sm" animation="border" /> : "Create Planning Plan"}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow-sm border-0" style={{ borderRadius: 14 }}>
              <Card.Body>
                <h5 style={{ color: brand.ink, fontWeight: 700 }}>Team Retro Board</h5>
                <p className="text-muted small mb-3" style={{ color: brand.sub }}>
                  Generates a retro template with sections (Went well, Didn’t go well, Action items).
                </p>
                <Button
                  type="button"
                  variant="dark"
                  onClick={handleRetro}
                  disabled={loading !== null}
                  style={{ borderRadius: 12, fontWeight: 700 }}
                >
                  {loading === "retro" ? <Spinner size="sm" animation="border" /> : "Generate Retro Board"}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow-sm border-0" style={{ borderRadius: 14 }}>
              <Card.Body>
                <h5 style={{ color: brand.ink, fontWeight: 700 }}>Team Capacity Board</h5>
                <p className="text-muted small mb-3" style={{ color: brand.sub }}>
                  Creates a capacity table (member, velocity, leaves, effective capacity).
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCapacity}
                  disabled={loading !== null}
                  style={{ borderRadius: 12, fontWeight: 700 }}
                >
                  {loading === "capacity" ? <Spinner size="sm" animation="border" /> : "Generate Capacity Board"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && <Alert className="mt-3" variant="danger">{error}</Alert>}
        {result && (
          <Alert className="mt-3" variant="success" style={{ whiteSpace: "pre-wrap" }}>
            {result}
          </Alert>
        )}
      </Container>
    </div>
  );
}

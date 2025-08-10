import { useState } from "react";
import { Container, Card, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from "axios";

const API = "http://localhost:3000";

export default function PO() {
  const [oneLiner, setOneLiner] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(null); // which action is running
  const [error, setError] = useState("");

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

  // Button 1 — AC + Description from single line
  const handleGenerateAC = () => {
    if (!oneLiner.trim()) { setError("Please enter a one-liner first."); return; }
    callApi(`${API}/po/generate-ac`, { oneLiner }, "ac");
  };

  // Button 2 — Team grooming (emails + board)
  const handleGrooming = () => {
    callApi(`${API}/po/grooming`, {}, "grooming");
  };

  // Button 3 — Team planning (emails + board)
  const handlePlanning = () => {
    callApi(`${API}/po/planning`, {}, "planning");
  };

  // Button 4 — Retro board
  const handleRetro = () => {
    callApi(`${API}/po/retro`, {}, "retro");
  };

  // Button 5 — Capacity board
  const handleCapacity = () => {
    callApi(`${API}/po/capacity`, {}, "capacity");
  };

  return (
    <Container className="py-4">
      <h3 className="mb-3">📋 Product Owner Workspace</h3>

      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <h5>Write complete AC & Description from a single line</h5>
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
          >
            {loading === "ac" ? <Spinner size="sm" /> : "Generate AC & Description"}
          </Button>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Team Grooming (emails + AI board)</h5>
              <p className="text-muted small mb-3">Creates agenda, assigns owners, sends mail (stub), and drafts a grooming board.</p>
              <Button
                type="button"
                variant="warning"
                onClick={handleGrooming}
                disabled={loading !== null}
              >
                {loading === "grooming" ? <Spinner size="sm" /> : "Create Grooming Plan"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Team Planning (emails + AI board)</h5>
              <p className="text-muted small mb-3">Drafts sprint goals, backlog order, capacity hints; sends mail (stub).</p>
              <Button
                type="button"
                variant="success"
                onClick={handlePlanning}
                disabled={loading !== null}
              >
                {loading === "planning" ? <Spinner size="sm" /> : "Create Planning Plan"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Team Retro Board</h5>
              <p className="text-muted small mb-3">Generates a retro template with sections (Went well, Didn’t go well, Action items).</p>
              <Button
                type="button"
                variant="dark"
                onClick={handleRetro}
                disabled={loading !== null}
              >
                {loading === "retro" ? <Spinner size="sm" /> : "Generate Retro Board"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Team Capacity Board</h5>
              <p className="text-muted small mb-3">Creates a capacity table (member, velocity, leaves, effective capacity).</p>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCapacity}
                disabled={loading !== null}
              >
                {loading === "capacity" ? <Spinner size="sm" /> : "Generate Capacity Board"}
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
  );
}
export default function PO() 
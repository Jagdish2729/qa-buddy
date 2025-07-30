import { useState } from "react";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import './App.css';


function App() {
  const [jiraText, setJiraText] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loadingMode, setLoadingMode] = useState(null); // 'manual' | 'automation' | null
  const [ticketId, setTicketId] = useState(""); // 👈 JIRA ticket ID

  const handleSubmit = async (mode) => {
    setLoadingMode(mode);
    setError("");
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

  return (
    
    
    <Container className="mt-5">
      <div className="qa-section">
  <div className="qa-links">
    <a href="https://www.guru99.com/manual-testing.html" target="_blank" rel="noopener noreferrer">
      Manual
    </a>
    <a href="https://playwright.dev/docs/intro" target="_blank" rel="noopener noreferrer">
      Playwright
    </a>
    <a href="https://www.postman.com/api-platform" target="_blank" rel="noopener noreferrer">
      API
    </a>
    <a href="https://www.w3schools.com/sql/" target="_blank" rel="noopener noreferrer">
      SQL
    </a>
    <a href="https://testautomationu.applitools.com/" target="_blank" rel="noopener noreferrer">
      Tools
    </a>
  </div>
</div>

      {/* 📚 Horizontal QA Study Links */}
{/* 📚 QA Study Material Section */}

      <h2 className="mb-4 text-center">🧪 JoJo Ka Dost</h2>
      
      {/* 🎟️ JIRA Ticket Fetch Section */}
      <Form.Group className="mb-3">
        <Form.Label>🎟️ Enter JIRA Ticket ID</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="e.g. SCRUM-1"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
          <Button
            variant="warning"
            onClick={handleFetchJira}
            disabled={loadingMode !== null}
          >
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
          <Button
            variant="primary"
            onClick={() => handleSubmit("manual")}
            disabled={loadingMode !== null}
          >
            {loadingMode === "manual" ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Generating...
              </>
            ) : (
              "Generate Manual Test Cases"
            )}
          </Button>
          <Button
            variant="success"
            onClick={() => handleSubmit("automation")}
            disabled={loadingMode !== null}
          >
            {loadingMode === "automation" ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Generating...
              </>
            ) : (
              "Generate Playwright Script"
            )}
          </Button>
        </div>
      </Form>

      {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
      {response && (
        <Alert variant="success" className="mt-4" style={{ whiteSpace: "pre-wrap" }}>
          {response}
        </Alert>
      )}
    </Container>
  );
}

export default App;

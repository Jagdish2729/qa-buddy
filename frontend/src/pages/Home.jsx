import { Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <h2 className="text-center mb-2">Welcome to QA Buddy</h2>
      <p className="text-center text-muted mb-4">Select your role to continue</p>

      <Row className="g-4">
        <Col md={4}>
          <Card className="role-card shadow-sm" role="button" onClick={() => navigate("/app")}>
            <Card.Body className="text-center">
              <div style={{ fontSize: 40 }}>🧪</div>
              <h5 className="mt-2 mb-1">I am a QA</h5>
              <p className="text-muted small mb-0">Generate manual/Gherkin/Playwright/Appium</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="role-card shadow-sm" role="button" onClick={() => navigate("/po")}>
            <Card.Body className="text-center">
              <div style={{ fontSize: 40 }}>📋</div>
              <h5 className="mt-2 mb-1">I am a Product Owner</h5>
              <p className="text-muted small mb-0">User story & AC generator (coming soon)</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="role-card shadow-sm" role="button" onClick={() => navigate("/coming-soon?role=dev")}>
            <Card.Body className="text-center">
              <div style={{ fontSize: 40 }}>💻</div>
              <h5 className="mt-2 mb-1">I am a Developer</h5>
              <p className="text-muted small mb-0">Code review & CI tips (coming soon)</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

// src/pages/Home.jsx
import { Container, Row, Col, Card, Button, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import genieImg from "../assets/genie.png";


export default function Home() {
  return (
    <div style={{ background: "#E6F6FF", minHeight: "100vh" }}>
      {/* Top Nav */}
      <Navbar expand="lg" variant="light" style={{ background: "transparent" }}>
        <Container>
         <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
  <img 
    src={genieImg} 
    alt="Genie Mascot" 
    style={{ width: "24px", height: "24px", objectFit: "contain" }} 
  />
  <span 
    style={{ 
      fontWeight: 700, 
      fontSize: 24, 
      color: "#0B4A6E" 
    }}
  >
    AgileGenieAI
  </span>
</Navbar.Brand>


          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav" className="justify-content-end">
            <Nav className="gap-3">
              <Nav.Link as={Link} to="/" style={{ color: "#0B4A6E" }}>Home</Nav.Link>
              <Nav.Link as={Link} to="/features" style={{ color: "#0B4A6E" }}>Features</Nav.Link>
              <Nav.Link as={Link} to="/contact" style={{ color: "#0B4A6E" }}>Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero */}
      <Container className="py-4 py-md-5">
        <Row className="align-items-center g-4">
          <Col md={7}>
            <h1 style={{ fontWeight: 800, color: "#0B4A6E", lineHeight: 1.1, fontSize: "clamp(28px, 5vw, 48px)" }}>
              AI-powered software solution for requirements, code & quality
            </h1>
            <p style={{ color: "#2B6C8C", marginTop: 16, fontSize: 18 }}>
              One-stop solution for building, testing, and maintaining software with the help of AI.
            </p>

            {/* Feature cards (3-up) */}
            <Row className="g-3 mt-4">
              <Col md={4}>
                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 14 }}>
                  <Card.Body className="text-center">
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                    <Card.Title style={{ color: "#0B4A6E", fontWeight: 700 }}>Requirements</Card.Title>
                    <Card.Text style={{ color: "#2B6C8C" }}>
                      Generate user stories and acceptance criteria
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 14 }}>
                  <Card.Body className="text-center">
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
                    <Card.Title style={{ color: "#0B4A6E", fontWeight: 700 }}>Test Case</Card.Title>
                    <Card.Text style={{ color: "#2B6C8C" }}>
                      AI generates manual & automated test cases
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 14 }}>
                  <Card.Body className="text-center">
                    <div style={{ fontSize: 36, marginBottom: 8 }}>💻</div>
                    <Card.Title style={{ color: "#0B4A6E", fontWeight: 700 }}>Code</Card.Title>
                    <Card.Text style={{ color: "#2B6C8C" }}>
                      Generate code in various programming languages
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="mt-4">
              <Button
                as={Link}
                to="/app"
                size="lg"
                style={{
                  background: "#2B7DEA",
                  borderColor: "#2B7DEA",
                  borderRadius: 12,
                  padding: "10px 20px",
                  fontWeight: 700,
                }}
              >
                Get Started
              </Button>
            </div>
          </Col>

          <Col md={5} className="text-center">
            <img
              src={genieImg}
              alt="AgileGenie AI Mascot"
              style={{
                width: "min(380px, 80%)",
                height: "auto",
                filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.15))",
              }}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

import { Container, Row, Col, Card, Button, } from "react-bootstrap";
import { Link } from "react-router-dom";
import genieImg from "../assets/genie.png";
import AppNavbar from "../components/Navbar";


export default function Home() {
  const brand = { bg: "#E6F6FF", ink: "#0B4A6E", sub: "#2B6C8C", primary: "#2B7DEA" };

  return (
    <div style={{ background: brand.bg, minHeight: "100vh" }}>
    <AppNavbar />
      {/* Hero */}
      <Container className="py-4 py-md-5">
        <Row className="align-items-center g-4">
          <Col md={7}>
            <h1
              style={{
                fontWeight: 800,
                color: brand.ink,
                lineHeight: 1.1,
                fontSize: "clamp(28px, 5vw, 48px)",
              }}
            >
              AI-powered software solution for requirements, code & quality
            </h1>
            <p style={{ color: brand.sub, marginTop: 16, fontSize: 18 }}>
              One-stop solution for building, testing, and maintaining software with the help of AI.
            </p>

            {/* Feature cards (3-up) */}
            <Row className="g-3 mt-4">
              <Col md={4}>
                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 14 }}>
                  <Card.Body className="text-center">
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                    <Card.Title style={{ color: brand.ink, fontWeight: 700 }}>
                      Requirements
                    </Card.Title>
                    <Card.Text style={{ color: brand.sub }}>
                      Generate user stories and acceptance criteria
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 14 }}>
                  <Card.Body className="text-center">
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
                    <Card.Title style={{ color: brand.ink, fontWeight: 700 }}>
                      Test Case
                    </Card.Title>
                    <Card.Text style={{ color: brand.sub }}>
                      AI generates manual & automated test cases
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 14 }}>
                  <Card.Body className="text-center">
                    <div style={{ fontSize: 36, marginBottom: 8 }}>💻</div>
                    <Card.Title style={{ color: brand.ink, fontWeight: 700 }}>
                      Code
                    </Card.Title>
                    <Card.Text style={{ color: brand.sub }}>
                      Generate code in various programming languages
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="mt-4">
              {/* FIX: /app -> /feature */}
              <Button
                as={Link}
                to="/feature"
                size="lg"
                style={{
                  background: brand.primary,
                  borderColor: brand.primary,
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

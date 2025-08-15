// src/pages/Feature.jsx
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import AppNavbar from "../components/Navbar";

export default function Feature() {
  const brand = {
    bg: "#E6F6FF",
    ink: "#0B4A6E",
    sub: "#2B6C8C",
    primary: "#2B7DEA",
    chip: "#8FD3FF",
  };

  const features = [
    {
      icon: "⚡",
      title: "AI-powered Test Generation",
      text: "Manual and Automation test cases in seconds with clean structure.",
    },
    {
      icon: "🧠",
      title: "Smart Requirement Parsing",
      text: "Turn one-liners into detailed user stories with acceptance criteria.",
    },
    {
      icon: "🔗",
      title: "Jira Integration",
      text: "Fetch ticket detail by entering the ticket ID.",
    },
    // {
    //   icon: "📊",
    //   title: "Visual Reports",
    //   text: "Pass/fail trends, flaky tests, and test coverage.",
    // },
  ];

  const roles = [
    {
      id: "qa",
      emoji: "🧪",
      title: "I am a QA",
      blurb: "Generate manual test cases & Playwright specs with reusable fixtures.",
      bullets: [
        "Gherkin / tabular test cases",
        "Playwright (TypeScript) scripts",
        "Flakiness & locator tips",
      ],
      href: "/app?role=qa",
      btn: "Get started as QA",
    },
    {
      id: "po",
      emoji: "🧭",
      title: "I am a PO",
      blurb: "Turn one-liners into user stories with AC, gap hints & exports.",
      bullets: [
        "User stories & acceptance criteria",
        "Edge-case suggestions",
        "CSV / shareable previews",
      ],
      href: "/po",
      btn: "Get started as PO",
    },
    {
      id: "dev",
      emoji: "👨‍💻",
      title: "I am a Dev",
      blurb: "Boilerplates, refactors & inline explanations to ship faster.",
      bullets: [
        "API / POM / utils boilerplates",
        "Refactor to clean, testable code",
        "Inline “why” explanations",
      ],
      href: "/app?role=dev",
      btn: "Get started as Dev",
    },
  ];

  return (
    <div style={{ background: brand.bg, minHeight: "100vh" }}>
      {/* Common Navbar */}
      <AppNavbar />

      <Container className="py-4 py-md-5">
        {/* HERO */}
        {
          <Row className="align-items-center">
            <Col>
              <h1
                style={{
                  fontWeight: 800,
                  color: brand.ink,
                  lineHeight: 1.1,
                  fontSize: "clamp(20px,5vw,39px)",
                }}
              >
                Everything You Need — Smarter, Faster, Together
              </h1>
              <p style={{ color: brand.sub, marginTop: 8, fontSize: 22 }}>
                Unlock the Power of AI in Every Step
              </p>
            </Col>
          </Row>
        }


        {/* OUR FEATURES */}
        <section className="mt-4">
          <h3
            style={{
              color: brand.ink,
              fontWeight: 800,
              marginBottom: 12,
              fontSize: "clamp(28px, 4vw, 40px)",
            }}
          >
            Our features
          </h3>
          <Row className="g-3">
            {features.map((f, i) => (
              <Col md={4} key={i}>
                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 16 }}>
                  <Card.Body>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{f.icon}</div>
                    <Card.Title style={{ color: brand.ink, fontWeight: 700 }}>
                      {f.title}
                    </Card.Title>
                    <Card.Text style={{ color: brand.sub }}>{f.text}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/*NEW: Test Coverage (Coming Soon) */}
        <section className="mt-4">
          <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div style={{ fontSize: 30 }}>📈</div>
                <h5 style={{ color: brand.ink, fontWeight: 800, margin: 0 }}>
                  Test Coverage <Badge bg="secondary" pill>Coming Soon</Badge>
                </h5>
              </div>
              <p style={{ color: brand.sub, marginBottom: 10 }}>
                Add your acceptance criteria and existing tests/code — get a clear coverage % and exactly what’s missing.
                We’ll also suggest the missing manual cases and automation skeletons.
              </p>
              <ul style={{ color: brand.sub, marginBottom: 0 }}>
                <li>
                  <b>Spec Coverage:</b> Maps each AC to tests (traceability) and shows % covered.
                </li>
                <li>
                  <b>Code Coverage (optional):</b> Upload Istanbul/nyc (JS) or JaCoCo (Java) reports to view line/branch coverage.
                </li>
                <li>
                  <b>Gap Finder:</b> Lists uncovered ACs and generates suggested test cases & code stubs.
                </li>
              </ul>
            </Card.Body>
          </Card>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-5">
          <h3 style={{ color: brand.ink, fontWeight: 800, marginBottom: 12 }}>
            How it works
          </h3>
          <Row className="g-3">
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 16 }}>
                <Card.Body>
                  <Badge bg="info" style={{ background: brand.chip, color: brand.ink }}>
                    1. Input
                  </Badge>
                  <h5 className="mt-2" style={{ color: brand.ink, fontWeight: 700 }}>
                    Paste ticket / idea / snippet
                  </h5>
                  <p style={{ color: brand.sub, marginBottom: 0 }}>
                    Start with a one-liner, a JIRA ticket ID, or a small code
                    snippet.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 16 }}>
                <Card.Body>
                  <Badge bg="info" style={{ background: brand.chip, color: brand.ink }}>
                    2. AI Magic
                  </Badge>
                  <h5 className="mt-2" style={{ color: brand.ink, fontWeight: 700 }}>
                    We generate the assets
                  </h5>
                  <p style={{ color: brand.sub, marginBottom: 0 }}>
                    Stories, acceptance criteria, test cases, and helpful code
                    scaffolds.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 16 }}>
                <Card.Body>
                  <Badge bg="info" style={{ background: brand.chip, color: brand.ink }}>
                    3. Export
                  </Badge>
                  <h5 className="mt-2" style={{ color: brand.ink, fontWeight: 700 }}>
                    Share & ship
                  </h5>
                  <p style={{ color: brand.sub, marginBottom: 0 }}>
                    Copy, CSV export, and shareable previews for your workflow.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ROLES: QA / PO / DEV */}
        <section className="mt-5">
          <h3 style={{ color: brand.ink, fontWeight: 800, marginBottom: 12 }}>
            Pick your path
          </h3>
        <Row className="g-4">
            {roles.map((s) => (
              <Col md={4} key={s.id}>
                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: 16 }}>
                  <Card.Body className="text-center">
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{s.emoji}</div>
                    <Card.Title style={{ color: brand.ink, fontWeight: 800 }}>
                      {s.title}
                    </Card.Title>
                    <Card.Text style={{ color: brand.sub }}>{s.blurb}</Card.Text>
                    <ul
                      style={{
                        color: brand.sub,
                        textAlign: "left",
                        margin: "0 auto",
                        maxWidth: 320,
                      }}
                    >
                      {s.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <Button
                      as="a"
                      href={s.href}
                      className="mt-3"
                      style={{
                        background: brand.primary,
                        borderColor: brand.primary,
                        borderRadius: 12,
                        fontWeight: 700,
                      }}
                    >
                      {s.btn}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* CTA BAND (bottom)
        <section className="mt-5 pb-4">
          <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <Card.Body className="d-flex flex-column flex-md-row align-items-center justify-content-between">
              <div>
                <h4 style={{ color: brand.ink, fontWeight: 800, marginBottom: 6 }}>
                  Ready to build with AI?
                </h4>
                <div style={{ color: brand.sub }}>
                  Start with a story and end with tested code.
                </div>
              </div>
              <Button
                as="a"
                href="/app"
                size="lg"
                className="mt-3 mt-md-0"
                style={{
                  background: brand.primary,
                  borderColor: brand.primary,
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                Get Started
              </Button>
            </Card.Body>
          </Card>
        </section> */}
        {/* ALL-ROUNDER PROMO */}
<section className="mt-3">
  <Card className="border-0 shadow-sm" style={{ borderRadius: 16 }}>
    <Card.Body className="d-flex flex-column flex-md-row align-items-center justify-content-between">
      <div>
        <h4 style={{ color: brand.ink, fontWeight: 800, marginBottom: 6 }}>
          Try our All-Rounder feature
        </h4>
        <div style={{ color: brand.sub }}>
          One flow: write one-liner → get User Story & AC → edit → (next) create Jira & generate tests.
        </div>
      </div>
      <Button
        as="a"
        href="/all-rounder"
        size="lg"
        className="mt-3 mt-md-0"
        style={{
          background: brand.primary,
          borderColor: brand.primary,
          borderRadius: 12,
          fontWeight: 700,
        }}
      >
        Try All-Rounder
      </Button>
    </Card.Body>
  </Card>
</section>
      </Container>
    </div>
  );
}

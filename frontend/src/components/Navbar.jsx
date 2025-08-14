import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import genieImg from "../assets/genie.png";

export default function AppNavbar() {
  const brandColor = "#0B4A6E";

  return (
    <Navbar expand="lg" variant="light" style={{ background: "transparent" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <img
            src={genieImg}
            alt="Genie Mascot"
            style={{ width: 24, height: 24, objectFit: "contain" }}
          />
          <span style={{ fontWeight: 700, fontSize: 24, color: brandColor }}>
            AgileGenieAI
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav" className="justify-content-end">
          <Nav className="gap-3">
            <Nav.Link as={Link} to="/" style={{ color: brandColor }}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/feature" style={{ color: brandColor }}>
              Features
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" style={{ color: brandColor }}>
              Contact
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import genieImg from "../assets/genie.png";
import kastleLogo from "../assets/kastle.png";

export default function AppNavbar() {
  const brandColor = "#0B4A6E";

  return (
    <Navbar expand="lg" variant="light" style={{ background: "transparent" }}>
      <Container>
         <Navbar.Brand href="/">
  <img
    src={kastleLogo}
    alt="kastle logo"
    width="98"
    height="68"
    className="me-2"
  />
  <span style={{ color: "#05529fff", fontWeight: 900 ,fontSize: "1.8rem",letterSpacing: "0.5px",}}>
    KastleGenieAI
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

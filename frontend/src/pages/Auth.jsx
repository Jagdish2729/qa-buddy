// import { useState, useEffect } from "react";
// import { Container, Card, Nav, Form, Button, InputGroup } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import "../App.css";
// import axios from "axios";
// import { login as saveToken, isLoggedIn } from "../utils/auth";

// export default function Auth() {
//   const [active, setActive] = useState("login"); // "login" | "signup"
//   const [showPwd, setShowPwd] = useState(false);
//   const [msg, setMsg] = useState("");
//   const [form, setForm] = useState({ name: "", email: "", password: "" });
//   const [submitting, setSubmitting] = useState(false);

//   const navigate = useNavigate();
//   const API_BASE = "http://localhost:3000";

//   // Already logged in? Send to home.
//   useEffect(() => {
//     if (isLoggedIn()) navigate("/");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setMsg("");

//     if (!form.name || !form.email || !form.password) {
//       setMsg("❌ Please fill all fields.");
//       return;
//     }
//     if (form.password.length < 6) {
//       setMsg("❌ Password should be at least 6 characters.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       await axios.post(`${API_BASE}/auth/register`, {
//         name: form.name,
//         email: form.email,
//         password: form.password,
//       });
//       setMsg("✅ Account created. Please login now.");
//       setActive("login");
//     } catch (err) {
//       setMsg("❌ " + (err?.response?.data?.message || "Signup failed"));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setMsg("");

//     if (!form.email || !form.password) {
//       setMsg("❌ Email & password required.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const res = await axios.post(`${API_BASE}/auth/login`, {
//         email: form.email,
//         password: form.password,
//       });
//       // Save real JWT token from backend
//       saveToken(res.data.token);
//       setMsg("✅ Logged in!");
//       navigate("/home");
//     } catch (err) {
//       setMsg("❌ " + (err?.response?.data?.message || "Login failed"));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="auth-bg">
//       <Container className="d-flex align-items-center justify-content-center vh-100">
//         <Card className="shadow-lg auth-card">
//           <Card.Body>
//             <h3 className="text-center mb-3">👋 Welcome to QA Buddy</h3>

//             <Nav
//               variant="tabs"
//               activeKey={active}
//               onSelect={(k) => setActive(k || "login")}
//               className="mb-3"
//             >
//               <Nav.Item><Nav.Link eventKey="login">Login</Nav.Link></Nav.Item>
//               <Nav.Item><Nav.Link eventKey="signup">Sign up</Nav.Link></Nav.Item>
//             </Nav>

//             {active === "signup" ? (
//               <Form onSubmit={handleSignup}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Full Name</Form.Label>
//                   <Form.Control
//                     name="name"
//                     value={form.name}
//                     onChange={onChange}
//                     placeholder="e.g. John Doe"
//                     required
//                     disabled={submitting}
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Email</Form.Label>
//                   <Form.Control
//                     type="email"
//                     name="email"
//                     value={form.email}
//                     onChange={onChange}
//                     placeholder="you@email.com"
//                     required
//                     disabled={submitting}
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Password</Form.Label>
//                   <InputGroup>
//                     <Form.Control
//                       type={showPwd ? "text" : "password"}
//                       name="password"
//                       value={form.password}
//                       onChange={onChange}
//                       placeholder="••••••••"
//                       required
//                       minLength={6}
//                       disabled={submitting}
//                     />
//                     <Button
//                       variant="outline-secondary"
//                       onClick={() => setShowPwd(!showPwd)}
//                       type="button"
//                       disabled={submitting}
//                     >
//                       {showPwd ? "Hide" : "Show"}
//                     </Button>
//                   </InputGroup>
//                   <Form.Text muted>Min 6 chars.</Form.Text>
//                 </Form.Group>

//                 <Button type="submit" className="w-100" variant="primary" disabled={submitting}>
//                   {submitting ? "Creating..." : "Create Account"}
//                 </Button>
//               </Form>
//             ) : (
//               <Form onSubmit={handleLogin}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Email</Form.Label>
//                   <Form.Control
//                     type="email"
//                     name="email"
//                     value={form.email}
//                     onChange={onChange}
//                     placeholder="you@email.com"
//                     required
//                     disabled={submitting}
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Password</Form.Label>
//                   <InputGroup>
//                     <Form.Control
//                       type={showPwd ? "text" : "password"}
//                       name="password"
//                       value={form.password}
//                       onChange={onChange}
//                       placeholder="••••••••"
//                       required
//                       disabled={submitting}
//                     />
//                     <Button
//                       variant="outline-secondary"
//                       onClick={() => setShowPwd(!showPwd)}
//                       type="button"
//                       disabled={submitting}
//                     >
//                       {showPwd ? "Hide" : "Show"}
//                     </Button>
//                   </InputGroup>
//                 </Form.Group>

//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <Form.Check type="checkbox" label="Remember me" disabled={submitting} />
//                   <Button variant="link" className="p-0" disabled={submitting}>Forgot password?</Button>
//                 </div>

//                 <Button type="submit" className="w-100" variant="success" disabled={submitting}>
//                   {submitting ? "Logging in..." : "Login"}
//                 </Button>
//               </Form>
//             )}

//             {msg && <div className="mt-3 small">{msg}</div>}
//           </Card.Body>
//         </Card>
//       </Container>
//     </div>
//   );
// }

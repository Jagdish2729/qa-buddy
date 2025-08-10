const express = require("express");
const router = express.Router();
const generateTestCases = require("./openaiService"); // reuse LLM client/prompt

// Button 1 — AC & description from one-liner
router.post("/generate-ac", async (req, res) => {
  try {
    const { oneLiner } = req.body || {};
    if (!oneLiner || !oneLiner.trim()) {
      return res.status(400).json({ message: "oneLiner required" });
    }
    const prompt = `
You are a Product Owner. From this one-liner, write:
1) A clear User Story (As a <user>, I want..., So that...)
2) A detailed Description (business context)
3) Acceptance Criteria (bullet or numbered)

One-liner: ${oneLiner}
    `;
    const result = await generateTestCases(prompt, "manual"); // reuse LLM call; mode doesn't matter here
    return res.json({ result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to generate AC" });
  }
});

// Button 2 — Grooming plan (mail + board) — stub
router.post("/grooming", async (_req, res) => {
  try {
    // Later: read team from DB/env, send emails via nodemailer, create “board” structure
    const template = `
Grooming Agenda:
- Goal of session
- Tickets to discuss
- Estimation approach
- Owners & SMEs
- Outcomes & next steps

(Email sending & board creation to be integrated)
    `.trim();
    return res.json({ result: template });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to create grooming plan" });
  }
});

// Button 3 — Planning plan — stub
router.post("/planning", async (_req, res) => {
  try {
    const template = `
Sprint Planning:
- Sprint Goal(s)
- Prioritized backlog (IDs)
- Capacity overview
- Risks/Dependencies
- Definition of Ready/Done

(Email sending & board creation to be integrated)
    `.trim();
    return res.json({ result: template });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to create planning plan" });
  }
});

// Button 4 — Retro board — stub
router.post("/retro", async (_req, res) => {
  try {
    const template = `
Retro Board:
- Went well:
- Didn't go well:
- Ideas/Experiments:
- Action items (Owner, ETA):

(Export/share link & vote feature can be added later)
    `.trim();
    return res.json({ result: template });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to create retro board" });
  }
});

// Button 5 — Capacity board — stub
router.post("/capacity", async (_req, res) => {
  try {
    const template = `
Capacity Board (example):
| Member | Velocity | Leaves/Meetings (hrs) | Effective Capacity (hrs) |
|--------|----------|------------------------|---------------------------|
| A      | 20 pts   | 6                      | 34                        |
| B      | 15 pts   | 4                      | 36                        |

(Next: pull calendar leaves & auto-calc)
    `.trim();
    return res.json({ result: template });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to create capacity board" });
  }
});

module.exports = router;

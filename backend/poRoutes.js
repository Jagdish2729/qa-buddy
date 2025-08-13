const express = require("express");
const router = express.Router();
const { generateWithOpenRouter } = require("./openaiService"); // ✅


// Button 1 — AC & description from one-liner
router.post("/generate-ac", async (req, res) => {
  try {
    const { oneLiner } = req.body || {};
    if (!oneLiner || !oneLiner.trim()) {
      return res.status(400).json({ message: "oneLiner required" });
    }
    const prompt = `
You are a Product Owner assistant. I will provide you with a single-line idea (one-liner summary) for a product feature. Your task is to transform it into a fully defined User Story with complete Acceptance Criteria.

Output Requirements:

User Story
Must follow the exact format:
User Story: As a <role>, I want <capability> so that <benefit>.
Keep it concise, clear, and business-focused.

Role = primary end user or stakeholder.

Capability = feature or functionality.

Benefit = value or outcome of having the feature.

Acceptance Criteria

Heading:
Acceptance Criteria:
Present as bullet points in clear, complete sentences.

Each bullet must describe a specific condition or requirement that must be met for the story to be considered complete.

Include functional, validation, and edge case scenarios where relevant.

Criteria must be clear, testable, and unambiguous.

Strict Rules:
Do not create test cases, tables, or code.

Do not use numbering or IDs.

Output must be plain text only — no Markdown tables or special formatting.

Do not include introductions, explanations, or summaries before or after the story.

Acceptance criteria must be detailed enough for developers and QA to implement and validate the feature without further clarification.

Input:
I will provide:

One-liner idea → A short sentence describing the product feature.

You will provide:

The User Story in the required format.

The Acceptance Criteria list as bullet points in proper English sentences.

One-liner: ${oneLiner}
    `;
    const result = await generateWithOpenRouter(prompt, { max_tokens: 800, temperature: 0.2 });
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

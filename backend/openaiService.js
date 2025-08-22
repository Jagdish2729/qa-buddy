// backend/openaiService.js
const fs = require("fs");
const path = require("path");

// extra deps for manual parsing
const { parse: csvParse } = require("csv-parse/sync");
const XLSX = require("xlsx");

// OpenAI SDK is ESM only. CommonJS me use karne ke liye dynamic import karo.
let OpenAICached = null;
async function getOpenAI() {
  if (!OpenAICached) {
    const mod = await import("openai");
    OpenAICached = mod.default;
  }
  return OpenAICached;
}

// Create client lazily (jab zarurat ho)
async function getClient() {
  const OpenAI = await getOpenAI();

  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  const baseURL = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").trim();

  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing in .env");

  const client = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: {
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:5173",
      "X-Title": "QA Buddy Helper",
    },
  });

  return client;
}

/* ============================================================
 * Generic text gen (PO features, etc.)
 * ============================================================ */
async function generateWithOpenRouter(prompt, opts = {}) {
  const client = await getClient();
  const model = (process.env.OPENROUTER_MODEL || "openrouter/auto").trim();

  const chat = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a helpful product/QA assistant." },
      { role: "user", content: prompt },
    ],
    max_tokens: typeof opts.max_tokens === "number" ? opts.max_tokens : 800,
    temperature: typeof opts.temperature === "number" ? opts.temperature : 0.2,
  });

  return chat.choices?.[0]?.message?.content || "";
}

/* ============================================================
 * Existing /generate flow (AC text -> selected mode)
 * ============================================================ */
async function generateTestCases(jiraText, mode) {
  if (!jiraText || !mode) throw new Error("jiraText or mode missing");

  const model = (process.env.OPENROUTER_MODEL || "openrouter/auto").trim();

  let prompt;
  switch (mode) {
    case "manual":
      prompt = `
You are a precise QA assistant.

TASK:
From the provided acceptance criteria (and Figma design if uploaded), output ONLY a GitHub-flavored Markdown table of test cases.

REQUIREMENTS:
Columns EXACTLY: Test Case ID | Description | Steps | Expected Result | Priority

Include the mandatory separator row after the header:
| Test Case ID | Description | Steps | Expected Result | Priority |
|--------------|-------------|-------|-----------------|----------|

Provide AT LEAST 10 full test cases (IDs: TC001...TC010).
"Steps" must be a numbered list inside a single cell (e.g., 1) ..., 2) ..., 3) ...).

If a Figma design is provided, incorporate visual and UI/UX elements into the Description, Steps, and Expected Result.

No extra text, no headings, no code fences, no explanations. Table ONLY.

Acceptance Criteria:
${jiraText}`.trim();
      break;

    case "automation":
      prompt = `
You are an expert QA automation engineer specializing in Playwright with TypeScript.
Generate Playwright tests from the acceptance criteria below.

Guidelines:
- Use @playwright/test with TypeScript.
- Prefer semantic locators (getByRole/getByLabel/getByTestId).
- Group with test.describe, strong expect() assertions.
- If flow is complex, also show a Page Object Model version (page classes + spec).
- Put TODO comments for unknown selectors/URLs.

Acceptance Criteria:
${jiraText}`.trim();
      break;

    case "gherkin":
      prompt = `
You are an expert QA analyst. Write a comprehensive Gherkin specification from the acceptance criteria.
- Use clear, atomic Given/When/Then scenarios.
- Include verifiable Then steps.
- Organize by logical Features.

Acceptance Criteria:
${jiraText}`.trim();
      break;

    case "java":
      prompt = `
You are a QA automation engineer (Java + Selenium + TestNG).
Generate Page Object Model classes + a TestNG test class from the acceptance criteria.
- Use meaningful locators (By.id/css/xpath), strong assertions.
- Add JavaDoc comments and TODOs for unknown parts.

Acceptance Criteria:
${jiraText}`.trim();
      break;

    case "appium":
      prompt = `
You are a mobile automation engineer (Appium + Java + TestNG).
Generate cross-platform (Android/iOS) test skeletons using POM.
- Provide platform-appropriate locators (MobileBy.*, iOSNsPredicateString).
- Use explicit waits; no sleeps.
- Add TODOs where selectors are unknown.

Acceptance Criteria:
${jiraText}`.trim();
      break;

    default:
      throw new Error("Invalid mode selected");
  }

  const client = await getClient();
  const chat = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a senior QA automation engineer." },
      { role: "user", content: prompt },
    ],
    max_tokens: 1400,
    temperature: 0.15,
  });

  let result = chat.choices?.[0]?.message?.content?.trim() || "";
  if (result.startsWith("```")) {
    result = result.replace(/^```[\s\S]*?\n/, "").replace(/```$/, "").trim();
  }

  // Strict retry only for "manual" table structure
  const hasHeader = /^\|\s*Test Case ID\s*\|\s*Description\s*\|\s*Steps\s*\|\s*Expected Result\s*\|\s*Priority\s*\|/i.test(result);
  const hasSeparator = /\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|/.test(result);
  const hasAtLeastOneRow = /\|?\s*TC0\d{2}\s*\|/i.test(result);

  if (mode === "manual" && hasHeader && (!hasSeparator || !hasAtLeastOneRow)) {
    const strictPrompt = `
Output ONLY this exact Markdown table structure filled with at least 6 rows:

| Test Case ID | Description | Steps | Expected Result | Priority |
|--------------|-------------|-------|-----------------|----------|

No extra text, no headings, no code fences.

Acceptance Criteria:
${jiraText}`.trim();

    const retry = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are a strict, precise QA test case generator." },
        { role: "user", content: strictPrompt },
      ],
      max_tokens: 1400,
      temperature: 0.1,
    });

    result = retry.choices?.[0]?.message?.content?.trim() || result;
    if (result.startsWith("```")) {
      result = result.replace(/^```[\s\S]*?\n/, "").replace(/```$/, "").trim();
    }
  }

  const outDir = path.join(__dirname, "outputs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "result.txt"), result, "utf-8");

  return result;
}

/* ============================================================
 * Manual files -> normalized cases (CSV/XLSX/JSON/MD/TXT)
 * ============================================================ */

// helpers for robust CSV/Markdown parsing
function sanitizeText(inputBuf) {
  const text = inputBuf.toString("utf8");
  return text.replace(/\uFEFF/g, "").replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}

function parseCsvLenient(buf) {
  const cleaned = sanitizeText(buf);
  try {
    return csvParse(cleaned, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
    });
  } catch (e1) {
    return csvParse(cleaned, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
    });
  }
}

// very simple markdown table parser (| col | col | ... |)
function parseMarkdownTable(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes("|"));

  if (lines.length < 2) return [];

  const headerLine = lines[0];
  // ignore purely separator-like lines
  const bodyLines = lines.slice(1).filter((l) => !/^[-\s|:]+$/.test(l));

  const headers = headerLine
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const rows = bodyLines.map((l) =>
    l
      .split("|")
      .map((s) => s.trim())
      .filter((_, i) => i < headers.length)
  );

  return rows.map((cols) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i] || ""));
    return obj;
  });
}

function normalizeHeaders(h) {
  return String(h).trim().toLowerCase().replace(/\s+/g, "");
}

function rowsToCases(rows) {
  return rows
    .map((r, i) => {
      const obj = {};
      Object.keys(r || {}).forEach((k) => (obj[normalizeHeaders(k)] = r[k]));

      const title =
        obj.title || obj.scenario || obj.testcasename || obj.name || `Case ${i + 1}`;
      const expected = obj.expected || obj.expectedresult || "";

      // Steps can be a single string or numbered columns step1, step2...
      let steps = [];
      if (obj.steps) {
        steps = String(obj.steps)
          .split(/\r?\n+/)
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        const stepCols = Object.keys(obj)
          .filter((k) => /^step\d+$/i.test(k))
          .sort();
        steps = stepCols.map((k) => String(obj[k]).trim()).filter(Boolean);
      }

      return {
        id: obj.testcaseid || obj.id || String(i + 1),
        title: String(title),
        steps,
        expected: expected ? String(expected) : undefined,
        tags: obj.tags ? String(obj.tags).split(/[,;]+/).map((s) => s.trim()) : undefined,
        priority: obj.priority ? String(obj.priority) : undefined,
      };
    })
    .filter((c) => c.title && c.steps?.length);
}

async function parseManualFiles(multerFiles = []) {
  const cases = [];
  for (const f of multerFiles) {
    const name = (f.originalname || "").toLowerCase();
    const buf = f.buffer;

    if (name.endsWith(".csv")) {
      try {
        const rows = parseCsvLenient(buf);
        cases.push(...rowsToCases(rows));
      } catch (e) {
        const text = sanitizeText(buf);
        const mdRows = parseMarkdownTable(text);
        if (mdRows.length) {
          cases.push(...rowsToCases(mdRows));
        } else {
          throw e;
        }
      }
      continue;
    }

    if (name.endsWith(".xlsx")) {
      const wb = XLSX.read(buf, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      cases.push(...rowsToCases(rows));
      continue;
    }

    if (name.endsWith(".json")) {
      const arr = JSON.parse(buf.toString());
      if (Array.isArray(arr)) cases.push(...rowsToCases(arr));
      continue;
    }

    // Markdown file (table) or plain text: 1 line = 1 step
    if (name.endsWith(".md")) {
      const text = sanitizeText(buf);
      const mdRows = parseMarkdownTable(text);
      if (mdRows.length) {
        cases.push(...rowsToCases(mdRows));
      } else {
        const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        if (lines.length) cases.push({ title: f.originalname, steps: lines });
      }
      continue;
    }

    if (name.endsWith(".txt")) {
      const text = sanitizeText(buf);
      const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      if (lines.length) cases.push({ title: f.originalname, steps: lines });
      continue;
    }
  }
  return cases;
}

/* ============================================================
 * Build prompts for manual -> automation
 * ============================================================ */
function buildPromptFromManual(kind, cases) {
  const mode = String(kind || "").toLowerCase();
  const baseIntro =
    "You convert MANUAL TEST CASES (title, steps, expected) into clean, production-ready automation.";

  const guidanceMap = {
    playwright:
      `Use @playwright/test (TypeScript). Prefer semantic locators (getByRole/getByLabel/getByTestId). Strong expect() assertions. Add TODO comments for unknown selectors.`,
    "java-selenium":
      `Use Java + Selenium + TestNG. Page Object Model. Provide page classes and test class(es) with assertions. Meaningful locators. JavaDoc comments.`,
    gherkin:
      `Output Gherkin .feature content: Feature/Scenario with Given/When/Then. Atomic, verifiable Then steps.`,
    appium:
      `Use Appium + Java + TestNG. Cross-platform (Android/iOS) with platform-appropriate locators. Explicit waits, no sleeps. POM-friendly structure.`,
  };

  const guidance =
    guidanceMap[mode] ||
    `Use a sensible automation format for "${mode}" with clean structure and comments.`;

  return [
    { role: "system", content: baseIntro },
    {
      role: "user",
      content: `
Transform the manual test cases below into ${mode} automation.

Guidance:
${guidance}

Manual cases (JSON):
${JSON.stringify(cases, null, 2)}

Output:
- Provide full content. If multiple files are implied, separate clearly and suggest file names.
- Add TODOs where selectors or data are unknown.
`.trim(),
    },
  ];
}

/* ============================================================
 * Public: generate from uploaded manual files
 * ============================================================ */
async function generateFromManualFiles(multerFiles, kind) {
  if (!multerFiles?.length) throw new Error("no manual files uploaded");
  if (!kind) throw new Error("mode required");

  const cases = await parseManualFiles(multerFiles);
  if (!cases.length) throw new Error("no valid test cases parsed");

  const model = (process.env.OPENROUTER_MODEL || "openrouter/auto").trim();
  const client = await getClient();
  const messages = buildPromptFromManual(kind, cases);

  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.3,
    max_tokens: 1800,
  });

  let text = resp.choices?.[0]?.message?.content?.trim() || "";
  if (text.startsWith("```")) {
    text = text.replace(/^```[\s\S]*?\n/, "").replace(/```$/, "").trim();
  }

  const outDir = path.join(__dirname, "outputs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "manual_out.txt"), text, "utf-8");

  return { text, casesCount: cases.length };
}

module.exports = {
  generateTestCases,
  generateWithOpenRouter,
  generateFromManualFiles,
};

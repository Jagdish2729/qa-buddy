// backend/openaiService.js
const fs = require("fs");
const path = require("path");

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
      // OpenRouter ko ye headers pasand aate hain:
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:5173",
      "X-Title": "QA Buddy Helper",
    },
  });

  return client;
}

/** ---------- Plain text generation helper (PO features, etc.) ---------- */
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

/** ---------- Main generator used by /generate (manual/automation/gherkin/java/appium) ---------- */
async function generateTestCases(jiraText, mode) {
  if (!jiraText || !mode) throw new Error("jiraText or mode missing");

  const model = (process.env.OPENROUTER_MODEL || "openrouter/auto").trim();

  let prompt;
  switch (mode) {
    case "manual":
      

    case "automation":
      prompt =
       `Given the acceptance criteria below, produce ONLY a GitHub-flavored Markdown table of test cases.

REQUIREMENTS:
- Columns exactly: Test Case ID | Description | Steps | Expected Result | Priority
- Include the mandatory separator line after the header, e.g.:
  | Test Case ID | Description | Steps | Expected Result | Priority |
  |--------------|-------------|-------|-----------------|----------|
- Provide at least 6 complete test cases (TC001...TC006).
- Steps must be numbered and concise.
- No intro/outro text. Output the table ONLY.

Acceptance Criteria:
${jiraText}
`.trim();
  break;

    case "gherkin":
      prompt =
        `Write clear **Gherkin** (Feature/Scenario/Given/When/Then) for the following acceptance criteria. Keep scenarios atomic and testable.\n\n${jiraText}`;
      break;

    case "java":
      prompt =
        `From the acceptance criteria (and implied Gherkin), generate **Java + Selenium** tests (TestNG/JUnit acceptable) using Page Object pattern. Include imports, example locators, and assertions.\n\n${jiraText}`;
      break;

    case "appium":
      prompt =
        `Generate **Appium** test code (JavaScript or Java) for the acceptance criteria. Include selectors for Android (and iOS if relevant), realistic waits, and strong assertions.\n\n${jiraText}`;
      break;

    default:
      throw new Error("Invalid mode selected");
  }

  console.log("🔧 OpenRouter config =>", {
    baseURL: (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").trim(),
    model,
    hasKey: !!(process.env.OPENROUTER_API_KEY || "").trim(),
  });

  const client = await getClient();

  const chat = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a senior QA automation engineer." },
      { role: "user", content: prompt },
    ],
    max_tokens: 1000,
    temperature: 0.2,
  });

  const result = chat.choices?.[0]?.message?.content || "No response";

  // Save output (for debugging)
  const outDir = path.join(__dirname, "outputs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "result.txt"), result, "utf-8");

  return result;
}

module.exports = { generateTestCases, generateWithOpenRouter };

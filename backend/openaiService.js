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

  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

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

async function generateTestCases(jiraText, mode) {
  if (!jiraText || !mode) throw new Error("jiraText or mode missing");

  const model = process.env.OPENROUTER_MODEL || "google/gemma-7b-it:free";

  let prompt;
  switch (mode) {
    case "manual":
      prompt =
        `Write detailed manual test cases in a Markdown table with columns: Test Case ID, Description, Steps, Expected Result, Priority.\n\nAcceptance Criteria:\n${jiraText}`;
      break;
    case "automation":
      prompt =
        `Generate Playwright **TypeScript** test code for this acceptance criteria. Use page.locator with stable selectors, meaningful assertions, and a reusable structure.\n\n${jiraText}`;
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
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    model,
    hasKey: !!process.env.OPENROUTER_API_KEY,
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

module.exports = generateTestCases;

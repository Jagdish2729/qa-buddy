// backend/openaiService.js
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const apiKey = process.env.OPENROUTER_API_KEY;
const baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY missing. Set it in backend/.env");
}

const openai = new OpenAI({
  apiKey,
  baseURL,
  // OpenRouter helpful headers (optional but good):
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:5173",
    "X-Title": "QA Buddy Helper",
  },
});

async function generateTestCases(jiraText, mode) {
  // guard
  if (!jiraText || !mode) throw new Error("jiraText or mode missing");

  // Choose model (pick one that exists on OpenRouter)
  // Safe picks: "openrouter/auto" OR a specific free model if you have it enabled.
  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";

  let prompt;
  switch (mode) {
    case "manual":
      prompt =
        `Write detailed manual test cases in Markdown table with columns: Test Case ID, Description, Steps, Expected Result, Priority.\n\nAcceptance Criteria:\n${jiraText}`;
      break;
    case "automation":
      prompt =
        `Generate Playwright TypeScript test code (Page Object friendly) for this acceptance criteria. Use realistic locators and good assertions.\n\n${jiraText}`;
      break;
    case "gherkin":
      prompt =
        `Write Gherkin scenarios (Feature/Scenario/Given/When/Then) for the acceptance criteria below. Keep it concise and testable.\n\n${jiraText}`;
      break;
    case "java":
      prompt =
        `Using the Gherkin implied by the acceptance criteria, generate Java Selenium (JUnit/TestNG) test code with Page Object pattern. Include imports and example locators.\n\n${jiraText}`;
      break;
    case "appium":
      prompt =
        `Generate Appium test code (JavaScript or Java) for the acceptance criteria. Include selectors for Android (and iOS if relevant), with clear steps and assertions.\n\n${jiraText}`;
      break;
    default:
      throw new Error("Invalid mode selected");
  }

  // 🔎 helpful logs
  console.log("🔧 OpenRouter config =>", { baseURL, model, hasKey: !!apiKey });

  const chat = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a senior QA automation engineer." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  const result = chat.choices?.[0]?.message?.content || "No response";
  const outDir = path.join(__dirname, "outputs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "result.txt"), result, "utf-8");
  return result;
}

module.exports = generateTestCases;

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
      prompt =
       `You are a precise QA assistant.

TASK:
From the provided acceptance criteria (and Figma design if uploaded), output ONLY a GitHub-flavored Markdown table of test cases.

REQUIREMENTS:

Columns EXACTLY: Test Case ID | Description | Steps | Expected Result | Priority

Include the mandatory separator row after the header:
| Test Case ID | Description | Steps | Expected Result | Priority |
|--------------|-------------|-------|-----------------|----------|

Provide AT LEAST 10 full test cases (IDs: TC001...TC010).

"Steps" must be a numbered list inside a single cell (e.g., 1) ..., 2) ..., 3) ...).

If a Figma design is provided, incorporate visual and UI/UX elements into the Description, Steps, and Expected Result to ensure accuracy, creativity, and technical depth.

No extra text, no headings, no code fences, no explanations. Table ONLY.

Acceptance Criteria:
${jiraText}
`.trim();
  break;
      
    case "automation":
      prompt =
       `You are an expert QA automation engineer specializing in Playwright with TypeScript. Based on the provided acceptance criteria (and any implied Gherkin scenarios), generate Playwright test scripts following these requirements:

1. Framework & Language
Use Playwright with TypeScript.

Ensure compatibility with the Playwright Test Runner.

Use ES module imports (import { test, expect } from '@playwright/test').

2. Test Approach Selection
If acceptance criteria involve a single page or simple flow:

Generate raw Playwright test(s) directly in a .spec.ts file.

If acceptance criteria involve multiple pages or complex flows:

Implement Page Object Model (POM):

Create page classes for each page.

Include element locators and action methods in page classes.

Keep test logic in .spec.ts files and call page object methods.

3. Code Standards
Use realistic selectors: page.locator(), getByRole(), getByTestId(), getByLabel().

Prefer auto-waiting; only use explicit waits (await page.waitFor...) if essential.

Include strong, descriptive assertions with expect().

Ensure tests are readable, maintainable, and modular.

4. Test Organization
Group related tests using test.describe().

Name test functions clearly to match the acceptance criteria.

Use constants for test data; keep them configurable.

5. Page Object Model Guidelines
Page Classes:

Include locators as class properties.

Include reusable interaction methods.

Keep locators meaningful and maintainable.

Test Files:

Import page classes.

Instantiate them inside test.beforeEach() where applicable.

Call methods for actions and assertions.

6. Comments & Documentation
Add TypeScript doc comments for classes, methods, and key test steps.

At the top of the file, document assumptions made if acceptance criteria are incomplete.

7. Output Requirements
Provide fully runnable TypeScript code inside fenced code blocks (typescript).

Clearly separate output sections:

Raw Playwright Test Example (if applicable)

POM Version (Page classes + tests)

Include all necessary imports.

Ensure code compiles and runs with minimal modifications in a Playwright project.

8. Assumptions
If selectors or actions are not explicitly given, infer them logically based on typical web app patterns.

Clearly list any inferred selectors, test data, or navigation paths in comments.
${jiraText}
`.trim();
  break;

    case "gherkin":
      prompt =
        `You are an expert QA analyst and business acceptance test writer.
Using the provided acceptance criteria, techniques, and examples from the "Prompt Engineering Presentation AG" document, write a comprehensive Gherkin specification.

Requirements:

Create separate Features for each major prompt engineering technique described in the document:

Role-Based Prompting

Context & Constraint-Based Prompting

Few-Shot Prompting

Chain of Thought (CoT)

Tree of Thought (ToT)

Self-Consistency Prompting

ReAct Prompting

Multimodal Prompting

Include a Common Mistakes and Fixes feature with atomic scenarios for each mistake type.

Include Real-World Use Case Workflows feature with at least one scenario for each professional domain mentioned (marketing, finance, customer service, IT, etc.).

All scenarios should be atomic, testable, and written in full descriptive Gherkin style (Given/When/Then).

Each Then step should be manually verifiable with clear success criteria.

Maintain business acceptance test perspective rather than low-level technical tests.

Use Indian market and professional context where relevant, matching the examples in the document.

Ensure clarity, readability, and relevance for QA engineers, developers, and non-technical stakeholders.\n\n${jiraText}`;
      break;

    case "java":
      prompt =
        `You are an expert QA automation engineer specializing in Java, Selenium WebDriver, TestNG, and the Page Object Model (POM) pattern. Based on the provided acceptance criteria and any implied Gherkin scenarios, generate complete Java test automation code that meets the following requirements:

Framework & Tools

Use Java with Selenium WebDriver.

The test framework should be TestNG (JUnit is acceptable as an alternative if specified).

Follow the Page Object Model pattern strictly, with separate classes for page objects and test cases.

Code Structure

Include all necessary imports for Selenium, TestNG/JUnit, and assertion libraries.

Provide example locators (e.g., By.id, By.cssSelector, By.xpath) for the UI elements referenced in the acceptance criteria.

Use meaningful method names in page object classes to represent user actions and verifications.

Organize code into at least two main components:

Page Object class(es) – encapsulating element locators and interaction methods.

Test class(es) – implementing test methods that call page object methods.

Assertions

Include clear assertions using TestNG’s Assert (or JUnit equivalents) to verify that the acceptance criteria are met.

Ensure assertions have descriptive failure messages.

Test Data & Parameters

Use placeholder test data if real data is not provided.

Keep selectors and test data easy to replace or update.

Readability & Best Practices

Write clean, readable, and maintainable code.

Include brief JavaDoc-style comments for key methods explaining their purpose.

Output Format

Provide all code inline in the response.

Clearly label sections for Page Object and Test Class.

Ensure code is runnable with minimal modification.

Example Context (if no criteria are given):
If specific acceptance criteria are missing, infer them logically from the described functionality, and document these assumptions in comments before the code.\n\n${jiraText}`;
      break;

    case "appium":
      prompt =
        `You are an expert mobile automation engineer specializing in Appium, Java, TestNG/JUnit, and cross-platform automation for Android and iOS. Based on the provided acceptance criteria (and any implied Gherkin scenarios), generate complete mobile test automation code that satisfies the following requirements:

1. Framework & Tools
Use Java with Appium.

Preferred test framework: TestNG (JUnit acceptable if explicitly stated).

Support both Android and iOS testing in a single, maintainable codebase.

2. Cross-Platform Selector Strategy
Provide separate selectors for Android and iOS using platform-specific strategies:

MobileBy.id, MobileBy.AccessibilityId, MobileBy.xpath for Android.

MobileBy.iOSNsPredicateString, MobileBy.AccessibilityId, MobileBy.xpath for iOS.

Implement platform detection using driver capabilities to dynamically select the correct locator at runtime.

Each selector must be:

Named meaningfully.

Documented in comments describing its purpose.

3. Waits & Stability
Use explicit waits (WebDriverWait with ExpectedConditions) to handle dynamic elements.

Avoid Thread.sleep() unless absolutely unavoidable.

Waits should:

Be realistic for mobile performance.

Include timeout constants for easy maintenance.

4. Assertions
Include strong, descriptive assertions verifying that acceptance criteria are met.

Use Assert.assertTrue, Assert.assertEquals, or equivalent with detailed failure messages.

Assertions should check both UI state and functional outcomes where possible.

5. Code Structure (Page Object Model)
Page Object Classes: One per screen, encapsulating:

Locators for Android and iOS.

User interaction methods.

Verification methods.

Test Classes:

Contain test methods representing Gherkin scenarios or acceptance criteria.

Call Page Object methods to perform actions and assertions.

Organize code into packages: pages.android, pages.ios, tests, and utils (if needed).

6. Cross-Platform Flow Handling
Where Android and iOS flows differ significantly:

Use conditional logic in page methods to handle platform-specific steps.

Alternatively, create platform-specific subclasses extending a common base page.

The generated test must run successfully for both platforms without code changes—only by switching desired capabilities.

7. Test Data & Configurability
Use configurable or placeholder test data if none is provided.

Store constants (timeouts, credentials, URLs) in a central config file or constants class.

8. Documentation & Best Practices
Add JavaDoc-style comments to key methods describing their purpose and usage.

Follow Appium best practices for element interaction (e.g., scrolls, swipes, tap gestures).

Ensure code is clean, modular, and maintainable.

9. Output Format
Include all Java code inline.

Clearly separate:

Android Page Object

iOS Page Object

Test Class

Provide all required imports.

Ensure code compiles and can be executed with minimal environment setup.

10. Assumptions
If acceptance criteria or Gherkin steps are incomplete:

Logically infer missing details based on common mobile app flows.

Document these inferred assumptions in comments before the code.

If selectors are not provided, use realistic, platform-appropriate placeholder locators that follow best practices.\n\n${jiraText}`;
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
    max_tokens: 1400,
    temperature: 0.15,
  });

let result = chat.choices?.[0]?.message?.content?.trim() || "";

// Kabhi model code-fence de de to clean:
if (result.startsWith("```")) {
  result = result.replace(/^```[\s\S]*?\n/, "").replace(/```$/,"").trim();
}

// Agar sirf header ya separator missing ho to ek strict retry
const hasHeader = /^\|\s*Test Case ID\s*\|\s*Description\s*\|\s*Steps\s*\|\s*Expected Result\s*\|\s*Priority\s*\|/i.test(result);
const hasSeparator = /\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|/.test(result);
const hasAtLeastOneRow = /\|?\s*TC0\d{2}\s*\|/i.test(result);

if (hasHeader && (!hasSeparator || !hasAtLeastOneRow)) {
  const strictPrompt = `
Output ONLY this exact Markdown table structure filled with at least 6 rows:

| Test Case ID | Description | Steps | Expected Result | Priority |
|--------------|-------------|-------|-----------------|----------|

Use the acceptance criteria below. No extra text, no headings, no code fences.

Acceptance Criteria:
${jiraText}
`.trim();

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

  // Clean code fence if any:
  if (result.startsWith("```")) {
    result = result.replace(/^```[\s\S]*?\n/, "").replace(/```$/,"").trim();
  }
}


  // Save output (for debugging)
  const outDir = path.join(__dirname, "outputs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "result.txt"), result, "utf-8");

  return result;
}

module.exports = { generateTestCases, generateWithOpenRouter };

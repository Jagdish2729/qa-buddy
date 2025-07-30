// backend/openaiService.js
require("dotenv").config(); // load .env first
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function generateTestCases(jiraText, mode) {
  let prompt = "";

  if (mode === "automation") {
    prompt = `Convert the following JIRA acceptance criteria into a Playwright TypeScript test script with proper locators and reusable structure:\n\n${jiraText}`;
  } else if (mode === "manual") {
    prompt = `Write detailed manual test cases for the following acceptance criteria in table format with Test Case ID, Description, Steps, Expected Result, Priority:\n\n${jiraText}`;
  } else if (mode === "gherkin") {
    prompt = `Convert the following acceptance criteria into Gherkin format using Feature, Scenario, Given, When, Then:\n\n${jiraText}`;
  } else if (mode === "java") {
    prompt = `Convert the following Gherkin test cases into Java Selenium JUnit test script using Page Object Model:\n\n${jiraText}`;
  } else if (mode === "appium") {
  prompt = `Convert the following JIRA acceptance criteria into Appium test code using Java for mobile automation testing. Use Page Object Model if possible:\n\n${jiraText}`;
  } else {
    throw new Error("Invalid mode selected");
  }
 const chatCompletion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo", //
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
});

  const result = chatCompletion.choices[0].message.content;
  const outputPath = path.join(__dirname, "outputs", "result.txt");
  fs.writeFileSync(outputPath, result);
  return result;
}

module.exports = generateTestCases;

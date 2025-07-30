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
  const prompt =
    mode === "automation"
      ? `Convert the following JIRA acceptance criteria into a Playwright TypeScript test script with proper locators and reusable structure:\n\n${jiraText}`
      : `Write detailed manual test cases for the following acceptance criteria in table format with Test Case ID, Description, Steps, Expected Result, Priority:\n\n${jiraText}`;

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

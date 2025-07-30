function generatePlaywrightPrompt(jiraText) {
  return `
You are a QA engineer. Based on the following Jira acceptance criteria:

"${jiraText}"

1. Generate 3 manual test cases (with title, steps, expected result).
2. Write a Playwright test file in TypeScript, using locator strategies from the assumed UI (semantic HTML, roles, ids, labels).
3. Include imports, test block, and assertions.
  `;
}

module.exports = { generatePlaywrightPrompt };

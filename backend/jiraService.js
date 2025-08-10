const axios = require("axios");

//  Recursively extract all text nodes from Atlassian Document Format
function extractTextFromADF(adf) {
  if (!adf || typeof adf !== "object") return "";
  if (adf.type === "text" && adf.text) return adf.text;

  if (Array.isArray(adf.content)) {
    return adf.content.map(extractTextFromADF).join(" ");
  }

  return "";
}

async function getJiraTicketDetails(ticketId) {
  const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
  const JIRA_EMAIL = process.env.JIRA_EMAIL;
  const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

  const url = `${JIRA_DOMAIN}/rest/api/3/issue/${ticketId}`;
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

  const response = await axios.get(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
  });

  const { summary, description } = response.data.fields;
  const fullDescription = extractTextFromADF(description);

  return `${summary}\n\n${fullDescription}`;
}

module.exports = {
  getJiraTicketDetails,
};

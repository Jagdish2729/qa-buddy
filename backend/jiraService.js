// backend/jiraService.js
const axios = require("axios");

const JIRA_DOMAIN = process.env.JIRA_DOMAIN || process.env.JIRA_BASE; // support either var
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!JIRA_DOMAIN) console.warn("⚠️ JIRA_DOMAIN (or JIRA_BASE) is not set in .env");
if (!JIRA_EMAIL) console.warn("⚠️ JIRA_EMAIL is not set in .env");
if (!JIRA_API_TOKEN) console.warn("⚠️ JIRA_API_TOKEN is not set in .env");

// ==== ADF helpers
function extractTextFromADF(adf) {
  if (!adf || typeof adf !== "object") return "";
  if (adf.type === "text" && adf.text) return adf.text;
  if (Array.isArray(adf.content)) return adf.content.map(extractTextFromADF).join(" ");
  return "";
}
function toADFParagraphs(lines = []) {
  return { type: "doc", version: 1, content: lines.map((t) => ({ type: "paragraph", content: [{ type: "text", text: t }] })) };
}
function acListADF(acArr = []) {
  if (!Array.isArray(acArr) || acArr.length === 0) return toADFParagraphs([]);
  return {
    type: "doc",
    version: 1,
    content: [
      { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Acceptance Criteria" }] },
      { type: "bulletList", content: acArr.map((item) => ({ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: item }]}] })) },
    ],
  };
}
function mergeADF(blocks = []) {
  return { type: "doc", version: 1, content: blocks.flatMap((b) => b?.content || []) };
}

// ==== READ
async function getJiraTicketDetails(ticketId) {
  if (!JIRA_DOMAIN || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    throw new Error("Jira env missing: JIRA_DOMAIN/JIRA_EMAIL/JIRA_API_TOKEN");
  }
  const url = `${JIRA_DOMAIN.replace(/\/$/, "")}/rest/api/3/issue/${ticketId}`;
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
  const resp = await axios.get(url, { headers: { Authorization: `Basic ${auth}`, Accept: "application/json" } });
  const { summary, description } = resp.data.fields || {};
  const full = extractTextFromADF(description);
  return `${summary || ""}\n\n${full || ""}`.trim();
}

// ==== user lookup for reporter
async function findUserAccountIdByEmail(email) {
  const base = JIRA_DOMAIN.replace(/\/$/, "");
  const auth = { username: JIRA_EMAIL, password: JIRA_API_TOKEN };
  const url = `${base}/rest/api/3/user/search?query=${encodeURIComponent(email)}`;
  const { data } = await axios.get(url, { auth, headers: { Accept: "application/json" } });
  // returns array of users; pick first match
  const user = Array.isArray(data) && data.length ? data[0] : null;
  return user?.accountId || null;
}

// ==== WRITE
async function createIssue({
  projectKey,
  issueType = "Story", // Story/Task/Bug etc.
  summary,
  description = "",       // full formatted "User Story + AC"
  acceptanceCriteria = [],// string[]
  reporterEmail,          // if provided, we will resolve to accountId
  reporterAccountId,      // if provided, we use directly (preferred)
}) {
  if (!JIRA_DOMAIN || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    throw new Error("Jira env missing: JIRA_DOMAIN/JIRA_EMAIL/JIRA_API_TOKEN");
  }
  if (!projectKey) throw new Error("projectKey required");
  if (!summary) throw new Error("summary required");

  const base = JIRA_DOMAIN.replace(/\/$/, "");
  const auth = { username: JIRA_EMAIL, password: JIRA_API_TOKEN };

  // description ADF: full description paragraph(s) + AC bullets
  // split description into paragraphs by blank line
  const descLines = (description || "").split("\n\n").map((s) => s.trim()).filter(Boolean);
  const descADF = toADFParagraphs(descLines.length ? descLines : [""]);
  const acADF = acListADF(acceptanceCriteria);
  const finalADF = mergeADF([descADF, acADF]);

  // reporter
  let reporter = undefined;
  try {
    if (reporterAccountId && reporterAccountId.trim()) {
      reporter = { id: reporterAccountId.trim() };
    } else if (reporterEmail && reporterEmail.trim()) {
      const accId = await findUserAccountIdByEmail(reporterEmail.trim());
      if (accId) reporter = { id: accId };
      // if not found, we silently continue; Jira will default reporter (or error based on project settings)
    }
  } catch (e) {
    // If lookup fails, let Jira try default reporter or error out
    console.warn("Reporter lookup failed:", e?.response?.data || e.message);
  }

  const payload = {
    fields: {
      project: { key: projectKey.toUpperCase() },
      issuetype: { name: issueType },
      summary,
      description: finalADF,
      ...(reporter ? { reporter } : {}), // add only if computed
    },
  };

  const { data } = await axios.post(`${base}/rest/api/3/issue`, payload, {
    auth,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  });

  return data; // { id, key, self }
}

module.exports = {
  getJiraTicketDetails,
  createIssue,
  // helpers (optional export)
  extractTextFromADF, toADFParagraphs, acListADF, mergeADF,
};

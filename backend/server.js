require("dotenv").config();
console.log("🔐 OPENROUTER_API_KEY present?", !!process.env.OPENROUTER_API_KEY);
console.log("🌐 OPENROUTER_BASE_URL:", process.env.OPENROUTER_BASE_URL);
const authRoutes = require("./authRoutes");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const generateTestCases = require("./openaiService");
const { getJiraTicketDetails } = require("./jiraService"); //  JIRA service import

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/auth", authRoutes);

// Route for generating test cases
app.post("/generate", async (req, res) => {
  const { jiraText, mode } = req.body;
  console.log(" Received JIRA text:", jiraText);
  console.log(" Mode selected:", mode);

  try {
    const result = await generateTestCases(jiraText, mode);
    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Error in /generate route:", error);
    res.status(500).json({ success: false, message: "Error generating test cases." });
  }
});

//  Route to fetch ticket summary + description from JIRA
app.post("/jira-ticket", async (req, res) => {
  const { ticketId } = req.body;
  console.log(" Fetching JIRA ticket:", ticketId);

  try {
    const text = await getJiraTicketDetails(ticketId);
    res.json({ success: true, jiraText: text });
  } catch (error) {
    console.error("❌ Error in /jira-ticket route:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch JIRA ticket." });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});

require("dotenv").config();
console.log("🔐 OPENROUTER_API_KEY present?", !!process.env.OPENROUTER_API_KEY);
console.log("🌐 OPENROUTER_BASE_URL:", process.env.OPENROUTER_BASE_URL);

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const { generateTestCases } = require("./openaiService");
const { getJiraTicketDetails, createIssue } = require("./jiraService");
const poRoutes = require("./poRoutes");

const app = express();
app.use(cors());

// JSON bodies ke liye
app.use(bodyParser.json());

// ----- Multer setup (uploads) -----
const storage = multer.memoryStorage();

const ALLOWED_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".pdf", ".fig",
  ".csv", ".xlsx", ".json", ".md", ".txt",
]);

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "application/pdf",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/json",
  "text/markdown",
  "text/plain",
  "application/octet-stream",
]);

const fileFilter = (req, file, cb) => {
  const ext = (path.extname(file.originalname || "") || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();

  if (ALLOWED_EXT.has(ext) || ALLOWED_MIME.has(mime)) return cb(null, true);

  if (ext === ".csv" || ext === ".xlsx" || ext === ".fig") return cb(null, true);

  return cb(new Error("Unsupported file type"));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter,
});


// ----- Routes -----
app.use("/po", poRoutes);

//  Generate route (now supports multipart: jiraText + mode + files)
app.post("/generate", upload.array("files", 10), async (req, res) => {
  try {
    // NOTE: Multipart me fields req.body me aate hain (strings)
    const { jiraText = "", mode = "", ticketId = "" } = req.body;

    // Files array: [{ buffer, originalname, mimetype, size, ... }, ...]
    const files = (req.files || []).map((f) => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      buffer: f.buffer, // <- ye aap model/logic ko pass kar sakte ho
    }));

    console.log("📝 Mode:", mode);
    console.log("🎟️ Ticket:", ticketId);
    console.log("📄 jiraText length:", jiraText.length);
    console.log("📎 files:", files.map((f) => ({ name: f.originalname, type: f.mimetype, bytes: f.size })));

    // --- Call your AI/service layer ---
    // Option A: agar tum generateTestCases ko enhance kar sakte ho:
    // const result = await generateTestCases({ jiraText, mode, files, ticketId });

    // Option B: backward compatibility (agar abhi 2 args hi accept karta hai):
    const result = await generateTestCases(jiraText, mode);

    return res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Error in /generate route:", error);
    const message =
      error?.message === "Unsupported file type"
        ? "Only PNG, JPG, JPEG, PDF, FIG files are allowed."
        : "Error generating test cases.";
    return res.status(500).json({ success: false, message });
  }
});

//  Route to fetch ticket summary + description from JIRA
app.post("/jira-ticket", async (req, res) => {
  try {
    const { ticketId } = req.body;
    const text = await getJiraTicketDetails(ticketId);
    return res.json({ success: true, jiraText: text });
  } catch (error) {
    console.error("❌ /jira-ticket:", error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch JIRA ticket." });
  }
});

// Create JIRA ticket (new)
app.post("/jira/create", async (req, res) => {
  try {
    const {
      projectKey,
      issueType = "Story",
      summary,
      description = "",
      acceptanceCriteria = [],
      reporterEmail,
      reporterAccountId,
    } = req.body || {};

    if (!summary) return res.status(400).json({ success: false, message: "summary required" });
    if (!(projectKey || process.env.JIRA_DEFAULT_PROJECT)) {
      return res.status(400).json({ success: false, message: "projectKey required" });
    }

    const data = await createIssue({
      projectKey: projectKey || process.env.JIRA_DEFAULT_PROJECT,
      issueType,
      summary,
      description,
      acceptanceCriteria,
      reporterEmail,
      reporterAccountId,
    });

    return res.json({ success: true, issueKey: data.key, issueId: data.id });
  } catch (e) {
    const rsp = e?.response?.data;
    console.error("❌ /jira/create:", rsp || e.message);
    return res.status(500).json({
      success: false,
      message: rsp?.errorMessages?.[0] || rsp?.errors || rsp || e.message || "Failed to create Jira ticket.",
    });
  }
});
app.post(
  "/manual/generate",
  upload.fields([{ name: "manualFiles", maxCount: 20 }]),
  async (req, res) => {
    try {
      const kind = String(req.body.mode || "");
      const files = req.files?.manualFiles || [];
      const { generateFromManualFiles } = require("./openaiService");
      const { text, casesCount } = await generateFromManualFiles(files, kind);
      return res.json({ success: true, result: text, count: casesCount });
    } catch (e) {
      console.error("❌ /manual/generate:", e);
      return res.status(500).json({ success: false, message: e.message || "Server error" });
    }
  }
);

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});

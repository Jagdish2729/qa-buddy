require("dotenv").config();
console.log("🔐 OPENROUTER_API_KEY present?", !!process.env.OPENROUTER_API_KEY);
console.log("🌐 OPENROUTER_BASE_URL:", process.env.OPENROUTER_BASE_URL);

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");

const { generateTestCases } = require("./openaiService");
const { getJiraTicketDetails } = require("./jiraService");
const poRoutes = require("./poRoutes");

const app = express();
app.use(cors());

// JSON bodies ke liye
app.use(bodyParser.json());

// ----- Multer setup (uploads) -----
const upload = multer({
  storage: multer.memoryStorage(),                 // files memory me aayengi: file.buffer
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }, // 10MB/file, max 10 files
  fileFilter: (req, file, cb) => {
    // Allowed: png, jpg, jpeg, pdf, fig (figma)
    const ok = /png|jpg|jpeg|pdf|fig$/i.test(file.originalname);
    if (!ok) return cb(new Error("Unsupported file type"), false);
    cb(null, true);
  },
});

// ----- Routes -----
app.use("/po", poRoutes);

// ✅ Generate route (now supports multipart: jiraText + mode + files)
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
  const { ticketId } = req.body;
  console.log("🔎 Fetching JIRA ticket:", ticketId);

  try {
    const text = await getJiraTicketDetails(ticketId);
    return res.json({ success: true, jiraText: text });
  } catch (error) {
    console.error("❌ Error in /jira-ticket route:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch JIRA ticket." });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});

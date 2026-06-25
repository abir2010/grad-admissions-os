const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const universityRoutes = require("./routes/universityRoutes");
const professorRoutes = require("./routes/professorRoutes");
const documentRoutes = require("./routes/documentRoutes");
const recommenderRoutes = require("./routes/recommenderRoutes");
const lorStatusRoutes = require("./routes/lorStatusRoutes");
const sopDraftRoutes = require("./routes/sopDraftRoutes");
const emailDraftRoutes = require("./routes/emailDraftRoutes");
const coordinatorRoutes = require("./routes/coordinatorRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const searchRoutes = require("./routes/searchRoutes");
const { protect } = require("./middleware/authMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.get("/api", (req, res) => {
  res.json({
    name: "Graduate Admissions OS API",
    routes: {
      health: "/api/health",
      auth: "/api/auth",
      search: "/api/search",
      universities: "/api/universities",
      professors: "/api/professors",
      documents: "/api/documents",
      recommenders: "/api/recommenders",
      lorStatuses: "/api/lor-statuses",
      sopDrafts: "/api/sop-drafts",
      emailDrafts: "/api/email-drafts",
      coordinators: "/api/coordinators",
      reminders: "/api/reminders",
      requirements: "/api/requirements",
    },
  });
});

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Graduate Admissions OS API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/search", protect, searchRoutes);
app.use("/api/universities", protect, universityRoutes);
app.use("/api/professors", protect, professorRoutes);
app.use("/api/documents", protect, documentRoutes);
app.use("/api/recommenders", protect, recommenderRoutes);
app.use("/api/lor-statuses", protect, lorStatusRoutes);
app.use("/api/sop-drafts", protect, sopDraftRoutes);
app.use("/api/email-drafts", protect, emailDraftRoutes);
app.use("/api/coordinators", protect, coordinatorRoutes);
app.use("/api/reminders", protect, reminderRoutes);
app.use("/api/requirements", protect, requirementRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

const path = require("path");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "..", "data");
const QUESTIONS_PATH = path.join(DATA_DIR, "questions.json");
const SESSIONS_PATH = path.join(DATA_DIR, "sessions.json");

const SESSION_STATUS = {
  IN_PROGRESS: "in-progress",
  SUBMITTED: "submitted",
};

module.exports = {
  PORT,
  QUESTIONS_PATH,
  SESSIONS_PATH,
  SESSION_STATUS,
};

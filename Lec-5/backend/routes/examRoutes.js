const express = require("express");
const {
  startExam,
  getQuestions,
  getQuestionById,
  submitAnswer,
  getSession,
  submitExam,
} = require("../controllers/examController");

const router = express.Router();

router.post("/start", startExam);
router.get("/mcq", getQuestions);
router.get("/mcq/:id", getQuestionById);
router.post("/answer", submitAnswer);
router.get("/session/:sessionId", getSession);
router.post("/submit", submitExam);

module.exports = router;

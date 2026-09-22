const {
  getAllQuestionsForStudent,
  getStudentQuestionById,
} = require("../services/questionService");

const {
  createSession,
  getSessionById,
  recordAnswer,
  submitSession,
} = require("../services/sessionService");

function startExam(req, res) {
  const { userId, name } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ message: "userId and name are required" });
  }

  const session = createSession(userId, name);
  return res.status(201).json({
    message: "Exam session started",
    sessionId: session.sessionId,
  });
}

function getQuestions(req, res) {
  const questions = getAllQuestionsForStudent();
  return res.json(questions);
}

function getQuestionById(req, res) {
  const { id } = req.params;
  const question = getStudentQuestionById(id);

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  return res.json(question);
}

function submitAnswer(req, res) {
  const { sessionId, questionId, selectedAnswer } = req.body;

  if (!sessionId || questionId === undefined || selectedAnswer === undefined) {
    return res.status(400).json({
      message: "sessionId, questionId and selectedAnswer are required",
    });
  }

  const result = recordAnswer(sessionId, questionId, selectedAnswer);
  if (result.error) {
    return res.status(result.statusCode).json({ message: result.error });
  }

  return res.json(result.data);
}

function getSession(req, res) {
  const { sessionId } = req.params;
  const session = getSessionById(sessionId);

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  return res.json(session);
}

function submitExam(req, res) {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: "sessionId is required" });
  }

  const result = submitSession(sessionId);
  if (result.error) {
    return res.status(result.statusCode).json({ message: result.error });
  }

  return res.json(result.data);
}

module.exports = {
  startExam,
  getQuestions,
  getQuestionById,
  submitAnswer,
  getSession,
  submitExam,
};

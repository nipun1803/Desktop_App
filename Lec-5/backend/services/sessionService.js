const fs = require("fs");
const { SESSIONS_PATH, SESSION_STATUS } = require("../config/constants");
const { getQuestionById } = require("./questionService");

function readSessions() {
  const raw = fs.readFileSync(SESSIONS_PATH, "utf-8");
  return JSON.parse(raw);
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2));
}

function generateSessionId() {
  return `session-${Date.now()}`;
}

function createSession(userId, name) {
  const sessions = readSessions();
  const newSession = {
    sessionId: generateSessionId(),
    userId,
    name,
    startedAt: new Date().toISOString(),
    submittedAt: null,
    status: SESSION_STATUS.IN_PROGRESS,
    attempted: 0,
    correct: 0,
    wrong: 0,
    answers: [],
  };

  sessions.push(newSession);
  saveSessions(sessions);
  return newSession;
}

function getSessionById(sessionId) {
  const sessions = readSessions();
  return sessions.find((item) => item.sessionId === sessionId) || null;
}

function recordAnswer(sessionId, questionId, selectedAnswer) {
  const question = getQuestionById(questionId);
  if (!question) {
    return { error: "Question not found", statusCode: 404 };
  }

  const sessions = readSessions();
  const sessionIndex = sessions.findIndex((item) => item.sessionId === sessionId);
  if (sessionIndex === -1) {
    return { error: "Session not found", statusCode: 404 };
  }

  const session = sessions[sessionIndex];
  if (session.status !== SESSION_STATUS.IN_PROGRESS) {
    return { error: "Exam is already submitted", statusCode: 400 };
  }

  const alreadyAnswered = session.answers.some(
    (answer) => answer.questionId === Number(questionId)
  );
  if (alreadyAnswered) {
    return { error: "Question already answered", statusCode: 400 };
  }

  const isCorrect = Number(selectedAnswer) === question.correctAnswer;
  session.answers.push({
    questionId: question.id,
    selectedAnswer: Number(selectedAnswer),
    isCorrect,
    answeredAt: new Date().toISOString(),
  });

  session.attempted += 1;
  if (isCorrect) {
    session.correct += 1;
  } else {
    session.wrong += 1;
  }

  saveSessions(sessions);

  return {
    success: true,
    data: {
      message: "Answer saved",
      isCorrect,
      attempted: session.attempted,
      correct: session.correct,
      wrong: session.wrong,
    },
  };
}

function submitSession(sessionId) {
  const sessions = readSessions();
  const sessionIndex = sessions.findIndex((item) => item.sessionId === sessionId);

  if (sessionIndex === -1) {
    return { error: "Session not found", statusCode: 404 };
  }

  const session = sessions[sessionIndex];
  session.status = SESSION_STATUS.SUBMITTED;
  session.submittedAt = new Date().toISOString();

  saveSessions(sessions);

  return {
    success: true,
    data: {
      message: "Exam submitted successfully",
      result: {
        attempted: session.attempted,
        correct: session.correct,
        wrong: session.wrong,
      },
    },
  };
}

module.exports = {
  readSessions,
  saveSessions,
  createSession,
  getSessionById,
  recordAnswer,
  submitSession,
};

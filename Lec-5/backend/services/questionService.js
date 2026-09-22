const fs = require("fs");
const { QUESTIONS_PATH } = require("../config/constants");

function readQuestions() {
  const raw = fs.readFileSync(QUESTIONS_PATH, "utf-8");
  return JSON.parse(raw);
}

function formatQuestionForStudent(question) {
  if (!question) return null;
  return {
    id: question.id,
    question: question.question,
    options: question.options,
  };
}

function getAllQuestionsForStudent() {
  const questions = readQuestions();
  return questions.map(formatQuestionForStudent);
}

function getQuestionById(id) {
  const questions = readQuestions();
  const numericId = Number(id);
  return questions.find((q) => q.id === numericId) || null;
}

function getStudentQuestionById(id) {
  const question = getQuestionById(id);
  return formatQuestionForStudent(question);
}

module.exports = {
  readQuestions,
  formatQuestionForStudent,
  getAllQuestionsForStudent,
  getQuestionById,
  getStudentQuestionById,
};

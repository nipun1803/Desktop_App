import { useState } from 'react';
import { SCREENS, DEFAULT_STUDENT, MESSAGES } from '../config/constants';
import { apiStartExam, apiFetchQuestions, apiSubmitAnswer, apiSubmitExam } from '../api/examApi';
import { startTimerOnMain } from '../services/athenaIpc';

export function useExam() {
  const [screen, setScreen] = useState(SCREENS.PERMISSIONS);
  const [studentName, setStudentName] = useState(DEFAULT_STUDENT.NAME);
  const [studentId, setStudentId] = useState(DEFAULT_STUDENT.ID);

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [savedAnswers, setSavedAnswers] = useState({});
  const [sessionProgress, setSessionProgress] = useState({ attempted: 0, correct: 0, wrong: 0 });
  const [examResult, setExamResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveStatusMsg, setSaveStatusMsg] = useState('');

  const startExam = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await startTimerOnMain();

      const sessionData = await apiStartExam(studentId, studentName);
      setSessionId(sessionData.sessionId);

      const qData = await apiFetchQuestions();
      setQuestions(qData);
      setScreen(SCREENS.EXAM);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error starting exam:", err);
      setErrorMsg(`Backend Connection Error: ${err.message}. Is backend server running on port 3000?`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
    setSaveStatusMsg('');
  };

  const submitCurrentAnswer = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const selectedOpt = selectedAnswers[currentQ.id];
    if (selectedOpt === undefined) {
      alert('Please select an option before saving your answer.');
      return;
    }

    if (!sessionId) {
      alert('No active exam session found.');
      return;
    }

    setLoading(true);
    setSaveStatusMsg('');
    try {
      const result = await apiSubmitAnswer(sessionId, currentQ.id, selectedOpt);
      if (!result.success) {
        if (result.message === "Question already answered") {
          setSaveStatusMsg(MESSAGES.ANSWER_ALREADY_SAVED);
        } else {
          throw new Error(result.message || 'Failed to submit answer');
        }
      } else {
        const { isCorrect, attempted, correct, wrong } = result.data;
        setSavedAnswers((prev) => ({
          ...prev,
          [currentQ.id]: { selectedAnswer: selectedOpt, isCorrect },
        }));
        setSessionProgress({ attempted, correct, wrong });
        setSaveStatusMsg(MESSAGES.ANSWER_SAVED_SUCCESS);
      }
    } catch (err) {
      console.error("Error saving answer:", err);
      setSaveStatusMsg(`Failed to save answer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!window.confirm(MESSAGES.SUBMIT_CONFIRM)) return;

    setLoading(true);
    try {
      const data = await apiSubmitExam(sessionId);
      setExamResult(data.result);
      setScreen(SCREENS.RESULTS);
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert(`Error submitting exam: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = (resetTimer) => {
    setScreen(SCREENS.PERMISSIONS);
    setSessionId(null);
    setQuestions([]);
    setSelectedAnswers({});
    setSavedAnswers({});
    setSessionProgress({ attempted: 0, correct: 0, wrong: 0 });
    setExamResult(null);
    if (resetTimer) resetTimer(0);
    setSaveStatusMsg('');
    setErrorMsg('');
  };

  const goToPreviousQuestion = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setSaveStatusMsg('');
  };

  const goToNextQuestion = () => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
    setSaveStatusMsg('');
  };

  return {
    screen,
    setScreen,
    studentName,
    setStudentName,
    studentId,
    setStudentId,
    sessionId,
    questions,
    currentIndex,
    setCurrentIndex,
    selectedAnswers,
    savedAnswers,
    sessionProgress,
    examResult,
    loading,
    errorMsg,
    saveStatusMsg,
    setSaveStatusMsg,
    startExam,
    handleOptionSelect,
    submitCurrentAnswer,
    handleSubmitExam,
    handleRestart,
    goToPreviousQuestion,
    goToNextQuestion,
  };
}

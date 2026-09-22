import React from 'react';
import ExamHeader from './ExamHeader';
import QuestionNavigator from './QuestionNavigator';
import QuestionCard from './QuestionCard';
import ExamFooter from './ExamFooter';

export default function ExamScreen({
  studentName,
  studentId,
  sessionId,
  videoRef,
  timer,
  showNativeRules,
  questions,
  currentIndex,
  setCurrentIndex,
  savedAnswers,
  selectedAnswers,
  sessionProgress,
  saveStatusMsg,
  setSaveStatusMsg,
  handleOptionSelect,
  submitCurrentAnswer,
  handleSubmitExam,
  goToPreviousQuestion,
  goToNextQuestion,
  loading,
}) {
  const currentQ = questions[currentIndex];
  const isSaved = savedAnswers[currentQ?.id] !== undefined;

  return (
    <div className="exam-container">
      <ExamHeader
        studentName={studentName}
        studentId={studentId}
        sessionId={sessionId}
        videoRef={videoRef}
        timer={timer}
        showNativeRules={showNativeRules}
      />

      <QuestionNavigator
        questions={questions}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        savedAnswers={savedAnswers}
        sessionProgress={sessionProgress}
        setSaveStatusMsg={setSaveStatusMsg}
      />

      <QuestionCard
        currentQ={currentQ}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        isSaved={isSaved}
        selectedOption={selectedAnswers[currentQ?.id]}
        onOptionSelect={handleOptionSelect}
        saveStatusMsg={saveStatusMsg}
        onSubmitAnswer={submitCurrentAnswer}
        loading={loading}
      />

      <ExamFooter
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onPrevious={goToPreviousQuestion}
        onNext={goToNextQuestion}
        onSubmitExam={handleSubmitExam}
        loading={loading}
      />
    </div>
  );
}

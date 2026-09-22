import React from 'react';
import Button from '../common/Button';

export default function ExamFooter({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmitExam,
  loading,
}) {
  return (
    <div className="exam-footer">
      <Button
        variant="outline"
        disabled={currentIndex === 0}
        onClick={onPrevious}
      >
        ← Previous Question
      </Button>

      <Button
        variant="danger"
        onClick={onSubmitExam}
        disabled={loading}
      >
        Submit Entire Exam
      </Button>

      <Button
        variant="outline"
        disabled={currentIndex === totalQuestions - 1}
        onClick={onNext}
      >
        Next Question →
      </Button>
    </div>
  );
}

import React from 'react';

export default function QuestionNavigator({
  questions,
  currentIndex,
  setCurrentIndex,
  savedAnswers,
  sessionProgress,
  setSaveStatusMsg,
}) {
  return (
    <>
      {/* Stepper / Question Navigator */}
      <div className="stepper-bar">
        <div className="stepper-title">Question Navigator:</div>
        <div className="stepper-pills">
          {questions.map((q, idx) => {
            const answered = savedAnswers[q.id] !== undefined;
            const active = idx === currentIndex;
            return (
              <button
                key={q.id}
                className={`stepper-pill ${active ? 'active' : ''} ${answered ? 'answered' : ''}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  if (setSaveStatusMsg) setSaveStatusMsg('');
                }}
              >
                Q{idx + 1} {answered ? '✓' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Stats Bar */}
      <div className="session-progress-strip">
        <span>
          Attempted: <strong>{sessionProgress.attempted} / {questions.length}</strong>
        </span>
        <span>
          Correct: <strong className="text-success">{sessionProgress.correct}</strong>
        </span>
        <span>
          Wrong: <strong className="text-danger">{sessionProgress.wrong}</strong>
        </span>
      </div>
    </>
  );
}

import React from 'react';
import OptionItem from './OptionItem';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuestionCard({
  currentQ,
  currentIndex,
  totalQuestions,
  isSaved,
  selectedOption,
  onOptionSelect,
  saveStatusMsg,
  onSubmitAnswer,
  loading,
}) {
  if (!currentQ) {
    return (
      <div className="question-card">
        <LoadingSpinner message="Loading question..." />
      </div>
    );
  }

  const isSuccess = saveStatusMsg.includes('✓');

  return (
    <div className="question-card">
      <div className="question-card-header">
        <span className="q-number-badge">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        {isSaved && <span className="saved-badge">✓ Answer Saved</span>}
      </div>

      <h2 className="question-title">{currentQ.question}</h2>

      {/* Options Grid */}
      <div className="options-list">
        {currentQ.options.map((optionText, optIdx) => (
          <OptionItem
            key={optIdx}
            questionId={currentQ.id}
            optionIndex={optIdx}
            optionText={optionText}
            isSelected={selectedOption === optIdx}
            onOptionSelect={onOptionSelect}
          />
        ))}
      </div>

      {/* Status Message */}
      {saveStatusMsg && (
        <div className={`save-status ${isSuccess ? 'success' : 'info'}`}>
          {saveStatusMsg}
        </div>
      )}

      {/* Action Bar inside Question Card */}
      <div className="question-card-actions">
        <Button
          variant="black"
          onClick={onSubmitAnswer}
          disabled={loading || selectedOption === undefined}
        >
          {loading ? 'Saving...' : 'Save & Submit Answer'}
        </Button>
      </div>
    </div>
  );
}

import React from 'react';

export default function OptionItem({
  questionId,
  optionIndex,
  optionText,
  isSelected,
  onOptionSelect,
}) {
  const optionLetter = String.fromCharCode(65 + optionIndex);

  return (
    <label
      className={`option-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onOptionSelect(optionIndex)}
    >
      <input
        type="radio"
        name={`question-${questionId}`}
        checked={isSelected}
        onChange={() => onOptionSelect(optionIndex)}
      />
      <span className="option-index">{optionLetter}.</span>
      <span className="option-text">{optionText}</span>
    </label>
  );
}

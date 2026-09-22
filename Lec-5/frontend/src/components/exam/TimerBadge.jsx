import React from 'react';

export default function TimerBadge({ timer }) {
  return (
    <div className="timer-badge">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span>{timer}s elapsed</span>
    </div>
  );
}

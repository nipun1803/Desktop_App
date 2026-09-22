import React from 'react';

export default function CandidateBadge({ studentName, studentId, sessionId }) {
  return (
    <div className="header-left">
      <div className="candidate-badge">
        <span className="candidate-name">{studentName}</span>
        <span className="candidate-id">({studentId})</span>
      </div>
      {sessionId && <span className="session-tag">Session: {sessionId}</span>}
    </div>
  );
}

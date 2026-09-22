import React from 'react';
import StatCard from '../common/StatCard';
import Button from '../common/Button';

export default function ResultsDashboard({
  studentName,
  studentId,
  sessionId,
  totalQuestions,
  examResult,
  sessionProgress,
  onRestart,
}) {
  const attempted = examResult?.attempted ?? sessionProgress.attempted;
  const correct = examResult?.correct ?? sessionProgress.correct;
  const wrong = examResult?.wrong ?? sessionProgress.wrong;
  const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

  return (
    <div className="page-container">
      <div className="results-card">
        <div className="results-header">
          <div className="success-icon">🎉</div>
          <h1>Exam Submitted Successfully!</h1>
          <p>
            Candidate: <strong>{studentName}</strong> ({studentId})
          </p>
          <p className="session-info">
            Session Reference: <code>{sessionId}</code>
          </p>
        </div>

        <div className="stats-grid">
          <StatCard variant="primary" value={`${percentage}%`} label="Total Score" />
          <StatCard value={`${attempted} / ${totalQuestions}`} label="Questions Attempted" />
          <StatCard variant="success" value={correct} label="Correct Answers" />
          <StatCard variant="danger" value={wrong} label="Wrong Answers" />
        </div>

        <div className="results-actions">
          <Button variant="primary" onClick={onRestart}>
            Attempt Another Exam Session
          </Button>
        </div>
      </div>
    </div>
  );
}

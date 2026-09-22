import React from 'react';
import CandidateBadge from './CandidateBadge';
import ProctorThumbnail from './ProctorThumbnail';
import TimerBadge from './TimerBadge';
import Button from '../common/Button';

export default function ExamHeader({
  studentName,
  studentId,
  sessionId,
  videoRef,
  timer,
  showNativeRules,
}) {
  return (
    <header className="exam-header">
      <CandidateBadge
        studentName={studentName}
        studentId={studentId}
        sessionId={sessionId}
      />

      <div className="header-right">
        <ProctorThumbnail videoRef={videoRef} />
        <TimerBadge timer={timer} />
        <Button variant="outline" size="small" onClick={showNativeRules}>
          Rules
        </Button>
      </div>
    </header>
  );
}

import React from 'react';
import ProfileInputs from './ProfileInputs';
import CameraPermissionCard from './CameraPermissionCard';
import FullscreenPermissionCard from './FullscreenPermissionCard';
import Button from '../common/Button';
import ErrorBanner from '../common/ErrorBanner';

export default function PermissionScreen({
  studentName,
  setStudentName,
  studentId,
  setStudentId,
  cameraEnabled,
  getCameraAccess,
  fullScreen,
  enableFullScreen,
  videoRef,
  errorMsg,
  loading,
  startExam,
  showNativeRules,
}) {
  return (
    <div className="page-container">
      {/* Header Greeting */}
      <div className="header-section">
        <h1>Hi {studentName}!</h1>
        <p>Kindly Allow the following Permissions to Start the test:</p>
      </div>

      {/* Profile Inputs */}
      <ProfileInputs
        studentName={studentName}
        setStudentName={setStudentName}
        studentId={studentId}
        setStudentId={setStudentId}
      />

      {/* Main Permissions Card */}
      <div className="card-container">
        {/* Section 1: Configure Heimdall / Camera */}
        <CameraPermissionCard
          cameraEnabled={cameraEnabled}
          getCameraAccess={getCameraAccess}
          videoRef={videoRef}
        />

        <div className="divider"></div>

        {/* Section 2: Switch to Fullscreen */}
        <FullscreenPermissionCard
          fullScreen={fullScreen}
          enableFullScreen={enableFullScreen}
        />
      </div>

      <ErrorBanner message={errorMsg} />

      {/* Bottom Action Buttons */}
      <div className="bottom-actions">
        <Button
          variant="primary"
          disabled={!cameraEnabled || !fullScreen || loading}
          onClick={startExam}
        >
          {loading ? 'Starting Exam...' : 'Go To Test'}
        </Button>

        <Button variant="outline" onClick={showNativeRules}>
          Need Help? / Rules
        </Button>
      </div>
    </div>
  );
}

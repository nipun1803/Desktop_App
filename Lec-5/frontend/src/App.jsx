import React from 'react';
import './App.css';
import { SCREENS } from './config/constants';
import { showNativeRules } from './services/athenaIpc';
import { useExam } from './hooks/useExam';
import { useCamera } from './hooks/useCamera';
import { useFullscreen } from './hooks/useFullscreen';
import { useTimer } from './hooks/useTimer';
import PermissionScreen from './components/permissions/PermissionScreen';
import ExamScreen from './components/exam/ExamScreen';
import ResultsDashboard from './components/results/ResultsDashboard';

function App() {
  const exam = useExam();
  const camera = useCamera();
  const fullscreen = useFullscreen();
  const timerState = useTimer(exam.screen, camera.saveVideoScreenShots);

  const handleRestart = () => {
    exam.handleRestart(timerState.setTimer);
  };

  // --- SCREEN ROUTING ---

  if (exam.screen === SCREENS.PERMISSIONS) {
    return (
      <PermissionScreen
        studentName={exam.studentName}
        setStudentName={exam.setStudentName}
        studentId={exam.studentId}
        setStudentId={exam.setStudentId}
        cameraEnabled={camera.cameraEnabled}
        getCameraAccess={camera.getCameraAccess}
        fullScreen={fullscreen.fullScreen}
        enableFullScreen={fullscreen.enableFullScreen}
        videoRef={camera.videoRef}
        errorMsg={exam.errorMsg || camera.cameraError}
        loading={exam.loading}
        startExam={exam.startExam}
        showNativeRules={showNativeRules}
      />
    );
  }

  if (exam.screen === SCREENS.EXAM) {
    return (
      <ExamScreen
        studentName={exam.studentName}
        studentId={exam.studentId}
        sessionId={exam.sessionId}
        videoRef={camera.videoRef}
        timer={timerState.timer}
        showNativeRules={showNativeRules}
        questions={exam.questions}
        currentIndex={exam.currentIndex}
        setCurrentIndex={exam.setCurrentIndex}
        savedAnswers={exam.savedAnswers}
        selectedAnswers={exam.selectedAnswers}
        sessionProgress={exam.sessionProgress}
        saveStatusMsg={exam.saveStatusMsg}
        setSaveStatusMsg={exam.setSaveStatusMsg}
        handleOptionSelect={exam.handleOptionSelect}
        submitCurrentAnswer={exam.submitCurrentAnswer}
        handleSubmitExam={exam.handleSubmitExam}
        goToPreviousQuestion={exam.goToPreviousQuestion}
        goToNextQuestion={exam.goToNextQuestion}
        loading={exam.loading}
      />
    );
  }

  if (exam.screen === SCREENS.RESULTS) {
    return (
      <ResultsDashboard
        studentName={exam.studentName}
        studentId={exam.studentId}
        sessionId={exam.sessionId}
        totalQuestions={exam.questions.length}
        examResult={exam.examResult}
        sessionProgress={exam.sessionProgress}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}

export default App;
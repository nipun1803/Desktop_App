// App.jsx
import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function App() {
  // state variables
  const [timer, setTimer] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [fullScreen, setFullScreen] = useState(() => Boolean(window.athena));
  const [cameraSnapFolder, setCameraSnapFolder] = useState('Default Pictures folder');
  const [autoSaveCameraShots, setAutoSaveCameraShots] = useState(true);
  const [proctoringError, setProctoringError] = useState('');
  const [userId, setUserId] = useState('student-101');
  const [name, setName] = useState('Vaibhav');
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswersMap, setUserAnswersMap] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [examResult, setExamResult] = useState(null);
  const [examStatus, setExamStatus] = useState('ready');
  const [examError, setExamError] = useState('');
  const [answerFeedback, setAnswerFeedback] = useState(null);

  const videoRef = useRef(null);
  const pipVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const autoSaveCameraShotsRef = useRef(true);
  const sessionIdRef = useRef(null);
  const userIdRef = useRef('student-101');

  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  async function apiRequest(path, options = {}) {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
    } catch {
      throw new Error('Exam backend is unavailable. Start it with "npm start" inside the backend folder.');
    }

    const responseText = await response.text();
    let data = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Exam backend returned an invalid response (${response.status}).`);
      }
    }

    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  async function startExam() {
    if (!cameraEnabled || !fullScreen) {
      setProctoringError('Enable camera access and fullscreen before starting the quiz.');
      return;
    }

    setExamError('');
    setExamStatus('loading');

    try {
      const questionList = await apiRequest('/exam/mcq');
      const session = await apiRequest('/exam/start', {
        method: 'POST',
        body: JSON.stringify({ userId: userId.trim(), name: name.trim() }),
      });

      setSessionId(session.sessionId);
      setQuestions(questionList);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setUserAnswersMap({});
      setSubmittedAnswers([]);
      setAnswerFeedback(null);
      setExamResult(null);
      setExamStatus('in-progress');
      if (window.athena) {
        await window.athena.setSession?.(userId.trim(), session.sessionId);
        await window.athena.startTimerOnMain(userId.trim(), session.sessionId);
        await window.athena.enableKiosk?.();
      }
    } catch (error) {
      if (window.athena) {
        await window.athena.disableKiosk?.();
        setFullScreen(false);
      }
      setExamStatus('ready');
      setExamError(error.message || 'Could not connect to the exam backend.');
    }
  }

  async function getCameraAccess() {
    setProctoringError('');
    try {
      const videoData = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = videoData;
      if (videoRef.current) videoRef.current.srcObject = videoData;
      setCameraEnabled(true);
    } catch {
      setProctoringError('Camera access is required for proctored quizzes.');
    }
  }

  async function enableFullScreen() {
    setProctoringError('');
    try {
      if (window.athena?.enableKiosk) {
        await window.athena.enableKiosk();
        setFullScreen(true);
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setFullScreen(Boolean(document.fullscreenElement));
      } else {
        throw new Error('Fullscreen is not supported');
      }
    } catch {
      setProctoringError('Fullscreen access is required for proctored quizzes.');
    }
  }

  // Uses ImageCapture API primary as requested, with fallback to Canvas if needed
  async function saveVideoScreenShot() {
    if (!autoSaveCameraShotsRef.current || !videoRef.current || !window.athena) return;
    const video = videoRef.current;
    if (!video.srcObject) return;

    const currentUserId = userIdRef.current || 'student-101';
    const currentSessionId = sessionIdRef.current || 'session-default';

    window.athena?.captureScreen?.(currentUserId, currentSessionId);

    try {
      const track = video.srcObject.getVideoTracks()[0];
      if (track && typeof ImageCapture !== 'undefined') {
        try {
          const imageCapture = new ImageCapture(track);
          const blob = await imageCapture.takePhoto();
          const buffer = await blob.arrayBuffer();
          await window.athena.storeCameraSnapImageOnDisk(buffer, currentUserId, currentSessionId);
          return;
        } catch (imageCaptureErr) {
          console.warn('ImageCapture API error, attempting Canvas fallback:', imageCaptureErr);
        }
      }

      // Canvas fallback
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const buffer = await blob.arrayBuffer();
          await window.athena.storeCameraSnapImageOnDisk(buffer, currentUserId, currentSessionId);
        }
      }, 'image/jpeg', 0.85);
    } catch (error) {
      console.error('Failed to capture proctoring snapshot:', error);
    }
  }

  async function chooseCameraSnapFolder() {
    if (!window.athena) return;
    const result = await window.athena.chooseCameraSnapFolder();
    if (!result.canceled && result.path) setCameraSnapFolder(result.path);
  }

  async function configureCameraStorage() {
    if (!window.athena) return;
    const result = await window.athena.showCameraStorageDialog();
    autoSaveCameraShotsRef.current = result.checkboxChecked;
    setAutoSaveCameraShots(result.checkboxChecked);
    if (result.response === 1) await chooseCameraSnapFolder();
  }

  async function submitAnswer() {
    if (selectedAnswer === null || !sessionId) return;

    const qId = questions[currentQuestionIndex].id;
    setUserAnswersMap((prev) => ({ ...prev, [qId]: selectedAnswer }));

    setExamError('');
    try {
      const answerResult = await apiRequest('/exam/answer', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          questionId: qId,
          selectedAnswer,
        }),
      });

      setAnswerFeedback(answerResult);
    } catch (error) {
      setExamError(error.message || 'Could not save your answer.');
    }
  }

  async function finishExam() {
    if (!sessionId) return;
    setExamError('');
    try {
      const submission = await apiRequest('/exam/submit', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      });
      setExamResult(submission.result || submission);
      if (submission.answers) setSubmittedAnswers(submission.answers);
      if (submission.questions) setQuestions(submission.questions);
      setExamStatus('submitted');
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      if (window.athena?.disableKiosk) {
        await window.athena.disableKiosk();
      }
    } catch (error) {
      setExamError(error.message || 'Could not submit the quiz.');
    }
  }

  async function advanceQuestion() {
    if (currentQuestionIndex === questions.length - 1) {
      await finishExam();
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
    setAnswerFeedback(null);
  }

  useEffect(() => {
    if (!window.athena) return undefined;

    window.athena.getDefaultCameraSnapFolder?.().then((folderPath) => {
      if (folderPath) setCameraSnapFolder(folderPath);
    });

    const removeTimerTickListener = window.athena.registerListenerForTimerTickFromMain(setTimer);
    const removeCameraSnapListener = window.athena.registerListenerForCameraSnapFromMain(saveVideoScreenShot);

    return () => {
      removeTimerTickListener();
      removeCameraSnapListener();
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = Boolean(document.fullscreenElement);
      if (examStatus !== 'in-progress') setFullScreen(isFullscreen || Boolean(window.athena));
      if (examStatus === 'in-progress' && !window.athena && !isFullscreen) {
        setProctoringError('You left fullscreen. Return to fullscreen to continue the exam.');
      }
    };

    const handleBeforeUnload = (event) => {
      if (examStatus === 'in-progress') {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    const handleKeyDown = (event) => {
      if (examStatus !== 'in-progress') return;
      const key = event.key.toLowerCase();
      const blockedCombo = (event.ctrlKey || event.metaKey) && ['w', 'r', 'q', 'c', 'v', 'x', 'a', 'p'].includes(key);
      if (event.key === 'Escape' || blockedCombo) event.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [examStatus]);

  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
    if (pipVideoRef.current && mediaStreamRef.current) {
      pipVideoRef.current.srcObject = mediaStreamRef.current;
    }

    if (examStatus === 'in-progress') {
      const handleWindowChange = () => saveVideoScreenShot();
      window.addEventListener('blur', handleWindowChange);
      document.addEventListener('visibilitychange', handleWindowChange);
      return () => {
        window.removeEventListener('blur', handleWindowChange);
        document.removeEventListener('visibilitychange', handleWindowChange);
      };
    }
  }, [examStatus]);

  useEffect(() => () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);


  return (
    <div
      className="page-container"
      onCopy={(e) => { if (examStatus !== 'submitted') e.preventDefault(); }}
      onPaste={(e) => { if (examStatus !== 'submitted') e.preventDefault(); }}
      onCut={(e) => { if (examStatus !== 'submitted') e.preventDefault(); }}
      onContextMenu={(e) => { if (examStatus !== 'submitted') e.preventDefault(); }}
    >
      {/* Top Header */}
      <header className="top-nav">
        <button
          className="back-action"
          disabled={examStatus === 'in-progress'}
          onClick={() => { if (examStatus !== 'in-progress') window.history.back(); }}
        >
          &lt; Back
        </button>
        <span className="brand-mark">ATHENA</span>
        <div className="top-right-actions">
          {examStatus === 'in-progress' && (
            <button className="btn btn-black btn-submit-top" onClick={finishExam}>
              Submit Exam
            </button>
          )}
          {examStatus === 'submitted' && window.athena && (
            <button className="btn btn-black btn-submit-top" onClick={() => window.athena.quitApp?.()}>
              Quit App
            </button>
          )}
          <span className="timer-label">{timer || '0'}s</span>
        </div>
      </header>

      <div className="revision-banner">
        <span>First Attempt Quiz</span>
        <span className="banner-detail">Your answers are recorded as you go</span>
      </div>

      {examStatus === 'ready' && (
        <section className="proctoring-panel card-container">
          <div className="proctoring-copy">
            <p className="eyebrow">SECURE QUIZ SESSION</p>
            <h2>Proctoring checks</h2>
            <p>Keep your camera on and remain in fullscreen. Athena captures periodic snapshots while you answer.</p>
            <div className="proctoring-actions">
              <button className="btn btn-black" disabled={cameraEnabled} onClick={getCameraAccess}>
                {cameraEnabled ? 'Camera connected' : 'Enable camera'}
              </button>
              <button className="btn btn-outline" disabled={fullScreen} onClick={enableFullScreen}>
                {fullScreen ? 'Fullscreen enabled' : 'Enable fullscreen'}
              </button>
              {window.athena && <button className="btn btn-outline" onClick={configureCameraStorage}>Storage options</button>}
            </div>
            <div className="proctoring-status">
              <span className={cameraEnabled ? 'status-ready' : ''}>{cameraEnabled ? 'Camera ready' : 'Camera required'}</span>
              <span className={fullScreen ? 'status-ready' : ''}>{fullScreen ? 'Fullscreen ready' : 'Fullscreen required'}</span>
              <span>{autoSaveCameraShots ? 'Snapshots enabled' : 'Snapshots paused'}</span>
            </div>
            {proctoringError && <p className="exam-error">{proctoringError}</p>}
            <p className="storage-path">Saving snapshots to: {cameraSnapFolder}</p>
          </div>
          <video ref={videoRef} autoPlay muted playsInline className="proctoring-preview" />
        </section>
      )}

      {examStatus === 'ready' && (
        <section className="start-panel card-container">
          <p className="eyebrow">ATHENA QUIZ RUNNER</p>
          <h1>Test your understanding.</h1>
          <p>Answer each question once. Your score will be recorded when you submit the quiz.</p>
          <div className="exam-fields">
            <label>Student ID<input value={userId} onChange={(event) => setUserId(event.target.value)} /></label>
            <label>Name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          </div>
          <button className="btn btn-primary" disabled={!cameraEnabled || !fullScreen || !userId.trim() || !name.trim()} onClick={startExam}>
            Start quiz
          </button>
        </section>
      )}

      {examStatus === 'loading' && <p className="exam-message">Connecting to the exam backend...</p>}
      {examError && <p className="exam-error">{examError}</p>}

      {/* Quiz Question View */}
      {examStatus === 'in-progress' && questions[currentQuestionIndex] && (
        <main className="question-card card-container">
          <div className="question-meta">
            <span>QUESTION {currentQuestionIndex + 1}/{questions.length}</span>
            <strong><span className="xp-coin">XP</span> {currentQuestionIndex + 1}/{questions.length} XP</strong>
          </div>
          <h1>{questions[currentQuestionIndex].question}</h1>
          <div className="answer-list">
            {questions[currentQuestionIndex].options.map((option, optionIndex) => {
              const isSelected = selectedAnswer === optionIndex;
              const isCorrect = answerFeedback && optionIndex === answerFeedback.correctAnswer;
              const isIncorrect = answerFeedback && isSelected && !answerFeedback.isCorrect;
              return (
                <button
                  className={`answer-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
                  key={option}
                  disabled={Boolean(answerFeedback)}
                  onClick={() => setSelectedAnswer(optionIndex)}
                >
                  <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
                </button>
              );
            })}
          </div>
          <button
            className="btn btn-primary"
            disabled={selectedAnswer === null}
            onClick={answerFeedback ? advanceQuestion : submitAnswer}
          >
            {answerFeedback ? (currentQuestionIndex === questions.length - 1 ? 'Submit quiz' : 'Next question') : 'Check answer'}
          </button>
        </main>
      )}

      {/* Live Proctoring PIP Badge during Quiz */}
      {examStatus === 'in-progress' && (
        <div className="proctoring-pip-badge">
          <div className="proctoring-pip-label">
            <span className="proctoring-pip-dot"></span> REC • 10s
          </div>
          <video ref={pipVideoRef} autoPlay muted playsInline />
        </div>
      )}

      {/* Submission & Answer Key View */}
      {examStatus === 'submitted' && (
        <section className="submitted-container card-container">
          <p className="eyebrow">QUIZ COMPLETE</p>
          <h1>Exam submitted</h1>
          <p>Your answers have been recorded for session {sessionId}.</p>
          
          {examResult && (
            <div className="result-grid">
              <strong>{examResult.attempted || 0}<small>Attempted</small></strong>
              <strong>{examResult.correct || 0}<small>Correct</small></strong>
              <strong>{examResult.wrong || 0}<small>Wrong</small></strong>
            </div>
          )}

          <div className="answers-review-section">
            <h2>Answer Key & Review</h2>
            {questions.map((q, qIndex) => {
              const userAns = submittedAnswers.find(a => a.questionId === q.id);
              const selectedIdx = userAns !== undefined ? userAns.selectedAnswer : userAnswersMap[q.id];

              return (
                <div key={q.id} className="review-question-card">
                  <div className="review-question-header">
                    <span className="question-number">Question {qIndex + 1}</span>
                    <h3>{q.question}</h3>
                  </div>

                  <div className="review-options-list">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedIdx === optIdx;
                      const isCorrect = q.correctAnswer !== undefined && optIdx === q.correctAnswer;
                      const isUserIncorrect = isSelected && !isCorrect;

                      let optionClass = 'review-option';
                      if (isCorrect) optionClass += ' correct-answer';
                      else if (isUserIncorrect) optionClass += ' wrong-answer';

                      return (
                        <div key={optIdx} className={optionClass}>
                          <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                          <span className="option-text">{opt}</span>
                          {isSelected && <span className="user-badge">Your Answer</span>}
                          {isCorrect && <span className="correct-badge">Correct Answer</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default App

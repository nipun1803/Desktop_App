import { useState, useEffect } from 'react';
import {
  registerTimerTickListener,
  registerCameraSnapListener,
  isAthenaDesktopEnvironment,
} from '../services/athenaIpc';

export function useTimer(screen, saveVideoScreenShots) {
  const [timer, setTimer] = useState(0);

  // Register Electron IPC Listeners
  useEffect(() => {
    let removeTimerTickListener;
    let removeCameraSnapListener;

    removeTimerTickListener = registerTimerTickListener((time) => {
      setTimer(Math.floor(time));
    });

    if (saveVideoScreenShots) {
      removeCameraSnapListener = registerCameraSnapListener(saveVideoScreenShots);
    }

    return () => {
      if (removeTimerTickListener) removeTimerTickListener();
      if (removeCameraSnapListener) removeCameraSnapListener();
    };
  }, [saveVideoScreenShots]);

  // Fallback Timer for Web Browser Testing
  useEffect(() => {
    let interval;
    if (screen === 'EXAM' && !isAthenaDesktopEnvironment()) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen]);

  return {
    timer,
    setTimer,
  };
}

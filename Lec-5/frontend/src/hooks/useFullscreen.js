import { useState, useCallback } from 'react';

export function useFullscreen() {
  const [fullScreen, setFullScreen] = useState(false);

  const enableFullScreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setFullScreen(true);
    } catch (error) {
      console.error("Fullscreen error:", error);
      setFullScreen(true);
    }
  }, []);

  return {
    fullScreen,
    enableFullScreen,
  };
}

import { useState, useRef, useCallback } from 'react';
import { MESSAGES } from '../config/constants';
import { storeCameraSnapImageOnDisk } from '../services/athenaIpc';

export function useCamera() {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);

  const getCameraAccess = useCallback(async () => {
    try {
      const videoData = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = videoData;
      }
      setCameraEnabled(true);
      setCameraError('');
    } catch (error) {
      console.error("Camera access error:", error);
      alert(MESSAGES.CAMERA_ERROR);
      setCameraError(MESSAGES.CAMERA_ERROR);
    }
  }, []);

  const saveVideoScreenShots = useCallback(async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    try {
      const track = videoRef.current.srcObject.getVideoTracks()[0];
      if (!track) return;

      if (window.ImageCapture) {
        const imageCapture = new window.ImageCapture(track);
        const blob = await imageCapture.takePhoto();
        const arrayBuffer = await blob.arrayBuffer();
        storeCameraSnapImageOnDisk(arrayBuffer);
      }
    } catch (error) {
      console.error("Failed to capture image via ImageCapture:", error);
    }
  }, []);

  return {
    cameraEnabled,
    cameraError,
    videoRef,
    getCameraAccess,
    saveVideoScreenShots,
  };
}

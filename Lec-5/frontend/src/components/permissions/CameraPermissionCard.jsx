import React from 'react';
import Button from '../common/Button';

export default function CameraPermissionCard({ cameraEnabled, getCameraAccess, videoRef }) {
  return (
    <div className="permission-item">
      <div className="icon-box">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </div>
      <div className="permission-content">
        <h3>Configure Heimdall</h3>
        <p>Kindly configure our proctoring app to attempt quiz/contests.</p>
        <div className="action-row">
          <Button
            variant="black"
            disabled={cameraEnabled}
            onClick={getCameraAccess}
          >
            {cameraEnabled ? '✓ Camera Connected' : 'Connect with Heimdall'}
          </Button>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`video-preview ${cameraEnabled ? 'active' : ''}`}
          />
        </div>
      </div>
    </div>
  );
}

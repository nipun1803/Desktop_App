import React from 'react';
import Button from '../common/Button';

export default function FullscreenPermissionCard({ fullScreen, enableFullScreen }) {
  return (
    <div className="permission-item">
      <div className="icon-box">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
      </div>
      <div className="permission-content">
        <h3>Switch to full screen</h3>
        <p>Kindly close all tabs and switch to full screen</p>
        <Button
          variant="secondary"
          disabled={fullScreen}
          onClick={enableFullScreen}
        >
          {fullScreen ? '✓ Full Screen Enabled' : 'Give Full Screen Permissions'}
        </Button>
      </div>
    </div>
  );
}

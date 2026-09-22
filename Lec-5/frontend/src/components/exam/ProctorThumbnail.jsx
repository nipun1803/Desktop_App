import React from 'react';

export default function ProctorThumbnail({ videoRef }) {
  return (
    <div className="proctor-box" title="Live Proctoring Active">
      <video ref={videoRef} autoPlay playsInline muted className="proctor-video" />
      <span className="rec-dot">● REC</span>
    </div>
  );
}

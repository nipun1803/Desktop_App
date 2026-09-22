import React from 'react';

/**
 * Reusable LoadingSpinner component for consistent loading states.
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner-container" style={{ textAlign: 'center', padding: '24px' }}>
      <p style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>{message}</p>
    </div>
  );
}

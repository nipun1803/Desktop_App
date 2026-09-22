import React from 'react';

/**
 * Reusable ErrorBanner component for consistent error displays.
 */
export default function ErrorBanner({ message }) {
  if (!message) return null;

  return <div className="error-banner">{message}</div>;
}

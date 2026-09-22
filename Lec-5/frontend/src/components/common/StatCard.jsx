import React from 'react';

/**
 * Reusable StatCard component for dashboard metrics and progress stats.
 */
export default function StatCard({ value, label, variant = 'default', className = '' }) {
  // variant: 'default' | 'primary' | 'success' | 'danger'
  const variantClass = variant !== 'default' ? variant : '';

  return (
    <div className={`stat-box ${variantClass} ${className}`.trim()}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

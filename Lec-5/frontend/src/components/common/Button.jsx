import React from 'react';

/**
 * Reusable Button component with variant, size, disabled and custom class support.
 */
export default function Button({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'black' | 'outline' | 'danger'
  size = 'medium',    // 'small' | 'medium' | 'large'
  disabled = false,
  type = 'button',
  className = '',
  title,
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    black: 'btn-black',
    outline: 'btn-outline',
    danger: 'btn-danger-submit',
  }[variant] || 'btn-primary';

  const sizeClass = size === 'small' ? 'btn-small' : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

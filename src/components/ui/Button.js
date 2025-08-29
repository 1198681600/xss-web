import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const loadingClass = loading ? 'btn--loading' : '';
  const disabledClass = (disabled || loading) ? 'btn--disabled' : '';

  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    loadingClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="btn__spinner" />}
      <span className="btn__content">{children}</span>
    </button>
  );
};

export default Button;
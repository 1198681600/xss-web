import React from 'react';
import './Input.css';

const Input = ({ 
  label,
  error,
  placeholder,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  className = '',
  ...props 
}) => {
  const inputClasses = [
    'input',
    error ? 'input--error' : '',
    disabled ? 'input--disabled' : ''
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    'input-wrapper',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
        {...props}
      />
      {error && <span className="input__error">{error}</span>}
    </div>
  );
};

export default Input;
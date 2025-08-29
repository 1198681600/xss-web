import React from 'react';
import './Select.css';

const Select = ({ 
  label,
  error,
  value,
  onChange,
  options = [],
  placeholder = '请选择...',
  disabled = false,
  required = false,
  className = '',
  ...props 
}) => {
  const selectClasses = [
    'select',
    error ? 'select--error' : '',
    disabled ? 'select--disabled' : ''
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    'select-wrapper',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="select__label">
          {label}
          {required && <span className="select__required">*</span>}
        </label>
      )}
      <div className="select__container">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="select__arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {error && <span className="select__error">{error}</span>}
    </div>
  );
};

export default Select;
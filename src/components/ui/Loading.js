import React from 'react';
import './Loading.css';

const Loading = ({ 
  size = 'md',
  color = 'primary',
  text,
  className = '',
  ...props 
}) => {
  const spinnerClasses = [
    'loading',
    `loading--${size}`,
    `loading--${color}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="loading-container" {...props}>
      <div className={spinnerClasses} />
      {text && <p className="loading__text">{text}</p>}
    </div>
  );
};

export default Loading;
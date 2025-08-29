import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  padding = true,
  hover = false,
  ...props 
}) => {
  const classes = [
    'card',
    hover ? 'card--hover' : '',
    padding ? 'card--padding' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {(title || subtitle) && (
        <div className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card__content">
        {children}
      </div>
    </div>
  );
};

export default Card;
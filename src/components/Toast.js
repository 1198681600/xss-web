import React, { useState, useEffect } from 'react';
import './Toast.css';

let toastId = 0;
let showToastFn = null;

export const toast = {
  success: (message) => showToastFn?.(message, 'success'),
  error: (message) => showToastFn?.(message, 'error'),
  warning: (message) => showToastFn?.(message, 'warning'),
  info: (message) => showToastFn?.(message, 'info'),
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastFn = (message, type = 'info') => {
      const id = ++toastId;
      const newToast = { id, message, type };
      
      setToasts(prev => [...prev, newToast]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 4000);
    };

    return () => {
      showToastFn = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast__content">
            <span className="toast__icon">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </span>
            <span className="toast__message">{toast.message}</span>
          </div>
          <button className="toast__close" onClick={() => removeToast(toast.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
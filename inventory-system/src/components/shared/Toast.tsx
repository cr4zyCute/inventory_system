import React, { useEffect } from 'react';
import './css/Toast.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
        return 'bi-x-circle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
        return 'bi-info-circle-fill';
      default:
        return 'bi-info-circle-fill';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <i className={`toast-icon ${getIcon()}`}></i>
        <span className="toast-message">{message}</span>
      </div>
      <button onClick={onClose} className="toast-close">
        <i className="bi-x"></i>
      </button>
    </div>
  );
};

export default Toast;

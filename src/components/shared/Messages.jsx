import React from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry, className = '' }) => (
  <div className={`alert-error ${className}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px', color: '#f87171' }} />
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '0.83rem', color: '#fca5a5' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ marginTop: '6px', fontSize: '0.75rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={11} /> Try again
        </button>
      )}
    </div>
  </div>
);

export const SuccessMessage = ({ message, onDismiss, className = '' }) => (
  <div className={`alert-success ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <CheckCircle size={15} style={{ flexShrink: 0, color: '#86efac' }} />
      <p style={{ fontSize: '0.83rem', color: '#86efac' }}>{message}</p>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#86efac', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 4px' }}>
        ×
      </button>
    )}
  </div>
);

export default ErrorMessage;

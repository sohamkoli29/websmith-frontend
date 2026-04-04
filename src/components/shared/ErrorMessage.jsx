import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, className = '' }) => (
  <div className={`alert alert-error ${className}`}>
    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, lineHeight: 1.5 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          marginTop: '6px', fontSize: '0.75rem', color: '#f87171',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0
        }}>
          <RefreshCw size={11} /> Try again
        </button>
      )}
    </div>
  </div>
);

export default ErrorMessage;

import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessMessage = ({ message, onDismiss, className = '' }) => (
  <div className={`alert alert-success ${className}`} style={{ justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <CheckCircle size={15} style={{ flexShrink: 0 }} />
      <p style={{ margin: 0 }}>{message}</p>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', color: '#86efac',
        cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1,
        padding: '0 4px', flexShrink: 0
      }}>×</button>
    )}
  </div>
);

export default SuccessMessage;

import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label, error, helperText,
  className = '', containerClassName = '',
  icon: Icon, ...props
}, ref) => {
  return (
    <div className={containerClassName} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && (
        <label className="form-label">
          {label}
          {props.required && <span className="required" style={{ color: '#f87171', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span className="input-icon">
            <Icon size={14} />
          </span>
        )}
        <input
          ref={ref}
          className={`dark-input ${error ? 'error' : ''} ${Icon ? 'input-icon-wrap' : ''} ${className}`}
          style={Icon ? { paddingLeft: '34px' } : undefined}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p style={{ fontSize: '0.72rem', color: error ? '#f87171' : 'var(--text-muted)', marginTop: '1px' }}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export { Input };
export default Input;

import { forwardRef, useId } from 'react';

const Input = forwardRef(({
  label, error, helperText, className = '', containerClassName = '',
  icon: Icon, id, ...props
}, ref) => {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={fieldId} className="form-label">
          {label}
          {props.required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="input-icon" aria-hidden="true">
            <Icon size={15} />
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? 'true' : undefined}
          className={`field-input ${error ? 'error' : ''} ${className}`}
          style={Icon ? { paddingLeft: '38px' } : undefined}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={error ? 'form-error' : 'form-helper'}>{error || helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export { Input };
export default Input;

import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  helperText, 
  className = '',
  containerClassName = '',
  labelClassName = '',
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          ref={ref}
          className={`text-black w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            Icon ? 'pl-10' : ''
          } ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
          } ${className}`}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

// Add display name for debugging
Input.displayName = 'Input';

export default Input;
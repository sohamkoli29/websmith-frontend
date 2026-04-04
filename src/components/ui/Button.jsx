import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children, variant = 'primary', size = 'md',
  isLoading = false, disabled = false, className = '', ...props
}, ref) => {
  const variantClass = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    outline:   'btn-ghost',
    ghost:     'btn-ghost',
    danger:    'btn-danger',
  }[variant] || 'btn-primary';

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      ref={ref}
      className={`${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export { Button };
export default Button;

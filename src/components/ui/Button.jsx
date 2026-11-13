import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

// Button styles live in index.css (btn-primary, btn-secondary, btn-ghost, btn-danger).
const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-ghost',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const Button = forwardRef(({
  children, variant = 'primary', size = 'md',
  isLoading = false, disabled = false, className = '', ...props
}, ref) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button
      ref={ref}
      className={`${VARIANTS[variant] || 'btn-primary'} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export { Button };
export default Button;

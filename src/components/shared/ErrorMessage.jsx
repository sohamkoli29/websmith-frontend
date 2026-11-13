import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, className = '' }) => (
  <div role="alert" className={`alert alert-error ${className}`}>
    <AlertCircle size={16} className="mt-0.5 shrink-0" />
    <div className="flex-1">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold underline">
          <RefreshCw size={12} /> Try again
        </button>
      )}
    </div>
  </div>
);

export default ErrorMessage;

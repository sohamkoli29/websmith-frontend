import { CheckCircle } from 'lucide-react';

const SuccessMessage = ({ message, onDismiss, className = '' }) => (
  <div role="status" className={`alert alert-success items-center justify-between ${className}`}>
    <div className="flex items-center gap-2.5">
      <CheckCircle size={16} className="shrink-0" />
      <p>{message}</p>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} aria-label="Dismiss" className="px-1 text-lg leading-none">×</button>
    )}
  </div>
);

export default SuccessMessage;

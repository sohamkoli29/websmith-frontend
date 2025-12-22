import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessMessage = ({ message, onDismiss, className = '' }) => {
  return (
    <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-green-800">{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="mt-2 text-sm font-medium text-green-700 hover:text-green-800"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
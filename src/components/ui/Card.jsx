import React from 'react';

const Card = ({ 
  children, 
  className = '',
  title,
  subtitle,
  headerActions,
  footer,
  ...props 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}
      {...props}
    >
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
import React from 'react';

const Card = ({
  children, className = '',
  title, subtitle, headerActions, footer,
  ...props
}) => {
  return (
    <div
      className={`dark-card ${className}`}
      {...props}
    >
      {(title || headerActions) && (
        <div className="dark-card-header">
          <div>
            {title    && <h3 className="dark-card-title">{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {headerActions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {headerActions}
            </div>
          )}
        </div>
      )}

      <div className="dark-card-body">
        {children}
      </div>

      {footer && (
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export { Card };
export default Card;

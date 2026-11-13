const Card = ({ children, className = '', title, subtitle, headerActions, footer, ...props }) => (
  <div className={`card ${className}`} {...props}>
    {(title || headerActions) && (
      <div className="card-header">
        <div>
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>
    )}
    <div className="card-body">{children}</div>
    {footer && <div className="border-t border-gray-200 px-5 py-3.5">{footer}</div>}
  </div>
);

export { Card };
export default Card;

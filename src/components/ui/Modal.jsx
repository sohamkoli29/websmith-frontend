import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen, onClose, title, children,
  size = 'md', showCloseButton = true, className = ''
}) => {
  const maxW = { sm: '440px', md: '620px', lg: '820px', xl: '1060px', full: '95vw' }[size] || '620px';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="dark-modal-overlay" onClick={onClose}>
      <div
        className={`dark-modal ${className}`}
        style={{ maxWidth: maxW }}
        onClick={e => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="dark-modal-header">
            {title && (
              <h3 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: '1rem', color: 'var(--text-primary)', margin: 0
              }}>
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button onClick={onClose} style={{
                width: '30px', height: '30px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '7px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
                flexShrink: 0, transition: 'all 0.2s'
              }}>
                <X size={14} />
              </button>
            )}
          </div>
        )}
        <div className="dark-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal };
export default Modal;

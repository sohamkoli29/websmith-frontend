import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const WIDTHS = { sm: '440px', md: '620px', lg: '820px', xl: '1060px', full: '96vw' };

const Modal = ({
  isOpen, onClose, title, children,
  size = 'md', showCloseButton = true, className = '',
}) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const titleId = useId();

  // Pages pass a new onClose function on every render. Keeping it in a ref means the
  // effect below runs only when the modal opens or closes, so typing in a form inside
  // the modal never steals focus.
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`modal ${className}`}
        style={{ maxWidth: WIDTHS[size] || WIDTHS.md }}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title ? <h3 id={titleId} className="modal-title">{title}</h3> : <span />}
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-ink hover:text-ink"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export { Modal };
export default Modal;

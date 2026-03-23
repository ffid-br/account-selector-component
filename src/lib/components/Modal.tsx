import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ModalProps } from '../types';
import { X } from 'lucide-react';

/**
 * Modal — Accessible overlay rendered via React portal.
 *
 * Supports dark mode via the Tailwind `dark` class on a parent element.
 * Closes on Escape key press or click outside the content area.
 * Locks body scroll while open.
 */
const Modal = ({ isOpen, onClose, title, className, children }: ModalProps & { className?: string }): JSX.Element => {
  const modalRef = useRef<HTMLDivElement>(null);
  const portalRoot = document.getElementById('modal-root') || document.createElement('div');

  // Ensure portal root is in the DOM
  useEffect(() => {
    if (!document.getElementById('modal-root')) {
      portalRoot.id = 'modal-root';
      document.body.appendChild(portalRoot);
    }

    return () => {
      if (document.getElementById('modal-root')?.childNodes.length === 0) {
        document.body.removeChild(portalRoot);
      }
    };
  }, []);

  // Escape key & click-outside handlers (registered only while open)
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return <></>;

  return ReactDOM.createPortal(
    <div
      className={`w-full mx-auto fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 transition-opacity ${className ?? ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={modalRef}
        className="ffid-modal-content w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300 ease-in-out"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1)' : 'scale(0.95)'
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-ffid-500 dark:focus:ring-ffid-400"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    portalRoot
  );
};

export default Modal;

import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ModalProps } from '../types';
import { X } from 'lucide-react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Modal — Accessible overlay rendered via React portal.
 *
 * Supports dark mode via the Tailwind `dark` class on a parent element.
 * Closes on Escape key press or click outside the content area.
 * Locks body scroll while open, traps Tab inside the dialog and restores
 * focus to the previously focused element on close. SSR-safe (no DOM
 * access during render).
 */
const Modal = ({ isOpen, onClose, title, className, children }: ModalProps & { className?: string }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  // Ensure portal root exists in the DOM (client-only)
  useEffect(() => {
    let root = document.getElementById('modal-root');
    const created = !root;
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }
    setPortalRoot(root);

    return () => {
      if (created && root && root.childNodes.length === 0) root.remove();
    };
  }, []);

  // Focus restore — efeito próprio keyado só em isOpen: onClose muda de
  // identidade a cada render do pai e re-executaria o cleanup a cada tecla
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => previouslyFocused?.focus();
  }, [isOpen]);

  // Escape, click-outside & focus trap (registered only while open)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !portalRoot) return null;

  return ReactDOM.createPortal(
    <div
      className={`w-full mx-auto fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/70 transition-opacity ${className ?? ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={modalRef}
        className="ffid-modal-content w-full max-w-lg rounded-t-2xl sm:rounded-xl bg-white dark:bg-gray-900 p-5 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300 ease-in-out"
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

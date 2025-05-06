import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ModalProps } from '../types';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, className, children }: ModalProps & { className?: string }): JSX.Element => {
  const modalRef = useRef<HTMLDivElement>(null);
  const portalRoot = document.getElementById('modal-root') || document.createElement('div');

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

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';
  }

  if (!isOpen) {
    document.removeEventListener('keydown', handleEscape);
    document.removeEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'auto';
    return <></>;
  }
    if (!isOpen) return <></>;

    return ReactDOM.createPortal(
      <div className={`w-full mx-auto fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${className}`}>
        <div 
          ref={modalRef}
          className="ffid-modal-content w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all duration-300 ease-in-out"
          style={{ 
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'scale(1)' : 'scale(0.95)'
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Close"
            >
              <X size={20} className="dark:text-gray-300" />
            </button>
          </div>
          {children}
        </div>
      </div>,
      portalRoot
    );
  };

export default Modal;
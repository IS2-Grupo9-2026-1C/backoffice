import { useEffect } from 'react';

type ModalSize = 'md' | 'lg';

interface ModalProps {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  children: React.ReactNode;
}

const SIZE_CLASS: Record<ModalSize, string> = {
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
};

const closeButtonClass =
  'flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600';

export default function Modal({ onClose, title, subtitle, size = 'md', children }: ModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 p-4"
      onMouseDown={onClose}
    >
      <div
        className={`relative z-50 max-h-[90vh] w-full ${SIZE_CLASS[size]} overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title ? (
          <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col gap-1">
              <h2 className="m-0 text-xl font-bold text-gray-900">{title}</h2>
              {subtitle && <span className="font-mono text-xs text-gray-500">{subtitle}</span>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={closeButtonClass}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </header>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className={`absolute right-4 top-4 ${closeButtonClass}`}
            aria-label="Cerrar"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

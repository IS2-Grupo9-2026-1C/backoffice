import { useEffect, useRef, useState } from 'react';

export interface FilterDropdownOption {
  id: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterDropdownOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  allLabel?: string;
  minWidth?: string;
}

export default function FilterDropdown({
  options,
  selectedId,
  onSelect,
  allLabel = 'Todos',
  minWidth = '180px',
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const selected = options.find((opt) => opt.id === selectedId);
  const selectedLabel = selected?.label ?? allLabel;

  function handleSelect(id: string) {
    onSelect(id);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef} style={{ minWidth }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-[10px] text-sm text-gray-900 outline-none hover:bg-gray-100"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-2 w-full overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-sm">
          <div className="max-h-64 overflow-auto py-1" role="listbox">
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                selectedId === ''
                  ? 'bg-gray-100 font-semibold text-indigo-600'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
              role="option"
              aria-selected={selectedId === ''}
            >
              {allLabel}
            </button>
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                  selectedId === opt.id
                    ? 'bg-gray-100 font-semibold text-indigo-600'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
                role="option"
                aria-selected={selectedId === opt.id}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

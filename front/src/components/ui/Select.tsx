import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  listClassName?: string;
  title?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
  buttonClassName = '',
  listClassName = '',
  title,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={ref} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        title={title}
        onClick={() => setOpen((v) => !v)}
        className={`w-full inline-flex items-center justify-between gap-2 text-left outline-none cursor-pointer ${buttonClassName} ${open ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          className={`absolute left-0 top-full z-50 mt-1 w-max min-w-full max-w-[calc(100vw-2rem)] max-h-64 overflow-y-auto overflow-x-hidden rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] shadow-lg ${listClassName}`}
        >
          {options.length === 0 && (
            <li className="px-3 py-2.5 text-xs text-[#6C757D] dark:text-[#B0BEC5]">Nenhuma opção</li>
          )}
          {options.map((o) => {
            const isSel = String(o.value) === String(value);
            return (
              <li key={String(o.value)}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                    isSel ? 'bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] font-bold' : 'text-[#212529] dark:text-[#FFFFFF] hover:bg-[#F5F7FB] dark:hover:bg-[#2C2C2C]'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSel && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

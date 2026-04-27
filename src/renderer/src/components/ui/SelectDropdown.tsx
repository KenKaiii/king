import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { ChevronDownIcon, CheckIcon, aspectRatioIcons } from '@/components/icons';

interface SelectDropdownProps {
  options: { value: string; label: string; disabled?: boolean }[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  showIcons?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'md' | 'sm';
}

export default memo(function SelectDropdown({
  options,
  value,
  onChange,
  icon,
  showIcons = false,
  placeholder = 'Select',
  fullWidth = false,
  size = 'md',
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange],
  );

  return (
    <div ref={dropdownRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-2 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] text-[var(--text-color--text-primary)] transition hover:border-[var(--base-color-brand--bean)] ${size === 'sm' ? 'h-6 px-3 text-xs' : 'h-10 px-4 text-sm'} ${fullWidth ? 'w-full' : ''}`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div className="hide-scrollbar absolute top-full left-0 z-50 mt-2 flex max-h-72 min-w-[240px] flex-col overflow-y-auto rounded-2xl border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--champagne)] px-1 pt-2 pb-2 shadow-lg">
          {options.map((option) => {
            if (option.disabled) {
              return (
                <div
                  key={option.value}
                  className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-[var(--base-color-brand--umber)]"
                >
                  {option.label}
                </div>
              );
            }

            const isSelected = option.value === value;
            const optionIcon = showIcons ? aspectRatioIcons[option.value] : null;

            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className="cursor-pointer px-1.5 py-1.5 text-sm"
              >
                <div className="group flex w-full items-center gap-1">
                  {showIcons && (
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-1 text-[var(--base-color-brand--umber)]/60 transition group-hover:bg-[var(--base-color-brand--shell)] ${isSelected ? 'bg-[var(--base-color-brand--shell)]' : 'bg-transparent'}`}
                    >
                      {optionIcon}
                    </div>
                  )}
                  <div
                    className={`flex h-8 flex-1 items-center justify-between rounded-md px-2 text-[var(--base-color-brand--bean)] transition group-hover:bg-[var(--base-color-brand--shell)] ${isSelected ? 'bg-[var(--base-color-brand--shell)]' : ''}`}
                  >
                    <span className="text-sm text-[var(--text-color--text-primary)]">
                      {option.label}
                    </span>
                    {isSelected && <CheckIcon />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

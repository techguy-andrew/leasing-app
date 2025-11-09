import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type IconName = 'search' | 'check';

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = "w-5 h-5" }) => {
  const icons: Record<IconName, React.ReactElement> = {
    search: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
  };
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{icons[name]}</svg>;
};

export interface FilterOption {
  value: string
  label: string
  color?: string
}

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  mode: 'single' | 'multi';
  options: FilterOption[];
  selectedValues: string[];
  onApply: (values: string[]) => void;
  showApplyButton?: boolean;
  autoCloseOnSelect?: boolean;
  fetchOptions?: () => Promise<FilterOption[]>;
}

export default function FilterDropdown({
  isOpen,
  onClose,
  triggerRef,
  mode,
  options,
  selectedValues,
  onApply,
  showApplyButton = false,
  autoCloseOnSelect = false,
  fetchOptions
}: FilterDropdownProps) {
  const [currentSelection, setCurrentSelection] = useState<string[]>(selectedValues);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOptions, setCurrentOptions] = useState<FilterOption[]>(options);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentSelection(selectedValues);
  }, [selectedValues, isOpen]);

  useEffect(() => {
    setCurrentOptions(options);
  }, [options]);

  const refreshOptions = useCallback(async () => {
    if (!fetchOptions) return;
    setIsLoading(true);
    try {
        const newOptions = await fetchOptions();
        setCurrentOptions(newOptions);
    } catch(e) {
        console.error("Failed to refresh options", e);
    } finally {
        setIsLoading(false);
    }
  }, [fetchOptions]);

  useEffect(() => {
    if(isOpen) {
        refreshOptions();
    }
  }, [isOpen, refreshOptions]);

  // Calculate dropdown position based on trigger element
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap below button
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 280) // Minimum 280px width
      });
    }
  }, [isOpen, triggerRef]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  const handleSelect = (value: string) => {
    let newSelection: string[];
    if (mode === 'single') {
      newSelection = [value];
      onApply(newSelection);
      if (autoCloseOnSelect) {
        onClose();
      }
    } else {
      if (value === 'All') {
        newSelection = ['All'];
      } else {
        const selectionsWithoutAll = currentSelection.filter(v => v !== 'All');
        newSelection = selectionsWithoutAll.includes(value)
          ? selectionsWithoutAll.filter(v => v !== value)
          : [...selectionsWithoutAll, value];
        if (newSelection.length === 0) {
            newSelection = ['All'];
        }
      }
      setCurrentSelection(newSelection);
    }
  };

  const filteredOptions = useMemo(() => {
    return currentOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentOptions, searchTerm]);

  const handleApplyClick = () => {
    onApply(currentSelection);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop for click-outside detection */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 40 }}
            onClick={onClose}
          />

          {/* Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }}
            className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[400px]"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              zIndex: 50
            }}
          >
            {/* Search */}
            {currentOptions.length > 5 && (
              <div className="p-3 border-b border-slate-200 flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon name="search" className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-500 text-sm">Loading...</div>
              ) : (
                <ul className="space-y-0.5">
                  {filteredOptions.map(option => {
                    const isSelected = currentSelection.includes(option.value);
                    return (
                      <li key={option.value}>
                        <button
                          onClick={() => handleSelect(option.value)}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                            isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {option.color && (
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: option.color }}
                            />
                          )}
                          <span className="flex-1">{option.label}</span>
                          {isSelected && <Icon name="check" className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Apply Button */}
            {showApplyButton && mode === 'multi' && (
              <div className="p-3 border-t border-slate-200 flex-shrink-0">
                <button
                  onClick={handleApplyClick}
                  className="w-full py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

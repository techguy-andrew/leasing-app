import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type IconName = 'tag' | 'building' | 'calendar' | 'clock' | 'sort' | 'search' | 'check' | 'x';

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = "w-6 h-6" }) => {
  const icons: Record<IconName, React.ReactElement> = {
    tag: <><path strokeLinecap="round" strokeLinejoin="round" d="M12.586 2.586a2 2 0 00-2.828 0L2 10.172V14h3.828l7.586-7.586a2 2 0 000-2.828z" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 14l6-6-4-4-6 6v4h4z" /></>,
    building: <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4m6 4v-4m6 4v-4m-9-4h5M9 7h1v1H9V7z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    sort: <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9M3 12h9m-9 4h13m-3-4v8m0 0l-4-4m4 4l4-4" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  };
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{icons[name]}</svg>;
};

export interface FilterOption {
  value: string
  label: string
  color?: string
}

interface FullScreenFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: IconName;
  mode: 'single' | 'multi';
  options: FilterOption[];
  selectedValues: string[];
  onApply: (values: string[]) => void;
  showApplyButton?: boolean;
  autoCloseOnSelect?: boolean;
  fetchOptions?: () => Promise<FilterOption[]>;
}

export default function FullScreenFilterModal({
  isOpen,
  onClose,
  title,
  icon = 'tag',
  mode,
  options,
  selectedValues,
  onApply,
  showApplyButton = false,
  autoCloseOnSelect = false,
  fetchOptions
}: FullScreenFilterModalProps) {
  const [currentSelection, setCurrentSelection] = useState<string[]>(selectedValues);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOptions, setCurrentOptions] = useState<FilterOption[]>(options);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSelect = (value: string) => {
    let newSelection: string[];
    if (mode === 'single') {
      newSelection = [value];
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
    }
    setCurrentSelection(newSelection);
    if (autoCloseOnSelect && mode === 'single') {
      onApply(newSelection);
    }
  };

  const filteredOptions = useMemo(() => {
    return currentOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentOptions, searchTerm]);

  const handleApplyClick = () => {
    onApply(currentSelection);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 flex items-center justify-center p-6 backdrop-blur-sm" style={{ top: 'var(--header-height, 0px)', zIndex: 40 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-slate-900/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0.0, 0.2, 1] // Custom easing for smooth feel
            }}
            className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[75vh]"
            style={{ zIndex: 50 }}
            onClick={e => e.stopPropagation()}
          >
            <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Icon name={icon} className="w-6 h-6 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <Icon name="x" className="w-6 h-6" />
              </button>
            </header>

            <div className="p-4 border-b border-slate-200 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon name="search" className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-slate-300 transition"
                />
              </div>
            </div>

            <main className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-slate-500 py-8">Loading...</div>
              ) : (
                <ul className="space-y-1">
                  {filteredOptions.map(option => {
                    const isSelected = currentSelection.includes(option.value);
                    return (
                      <li key={option.value}>
                        <button
                          onClick={() => handleSelect(option.value)}
                          className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          {option.color && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }}></span>}
                          <span className="flex-1">{option.label}</span>
                          {isSelected && <Icon name="check" className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </main>

            {showApplyButton && (
              <footer className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
                <button
                  onClick={handleApplyClick}
                  className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Apply
                </button>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface DateInputDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  label: string;
  date: string;
  onApply: (date: string) => void;
  showApplyButton?: boolean;
}

export default function DateInputDropdown({
  isOpen,
  onClose,
  triggerRef,
  label,
  date,
  onApply,
  showApplyButton = true
}: DateInputDropdownProps) {
  const [currentDate, setCurrentDate] = useState(date);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update internal state when prop changes
  useEffect(() => {
    setCurrentDate(date);
  }, [date, isOpen]);

  // Calculate dropdown position based on trigger element
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 280)
      });
    }
  }, [isOpen, triggerRef]);

  // Handle click outside to close
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

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isOpen, onClose]);

  const handleApply = () => {
    onApply(currentDate);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showApplyButton) {
      handleApply();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for click detection */}
      <div className="fixed inset-0 z-40" />

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }}
            style={{
              position: 'absolute',
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
            className="z-50 bg-white border border-slate-200 rounded-xl shadow-2xl"
          >
            {/* Content */}
            <div className="p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-slate-300 transition"
                autoFocus
              />
            </div>

            {/* Apply Button */}
            {showApplyButton && (
              <div className="p-3 border-t border-slate-200">
                <button
                  onClick={handleApply}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

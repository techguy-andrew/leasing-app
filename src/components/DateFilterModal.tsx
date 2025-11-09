import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type IconName = 'calendar' | 'x';

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = "w-6 h-6" }) => {
  const icons: Record<IconName, React.ReactElement> = {
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  };
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{icons[name]}</svg>;
};

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  date: string;
  onApply: (date: string) => void;
}

export default function DateFilterModal({
  isOpen,
  onClose,
  title,
  label,
  date,
  onApply
}: DateFilterModalProps) {
  const [tempDate, setTempDate] = useState(date);

  useEffect(() => {
    if (isOpen) {
      setTempDate(date);
    }
  }, [isOpen, date]);

  const handleApply = () => {
    onApply(tempDate);
    onClose();
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
              ease: [0.4, 0.0, 0.2, 1]
            }}
            className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[75vh]"
            style={{ zIndex: 50 }}
            onClick={e => e.stopPropagation()}
          >
            <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Icon name="calendar" className="w-6 h-6 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <Icon name="x" className="w-6 h-6" />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">{label}</label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-slate-300 transition"
                />
              </div>
            </main>

            <footer className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
              <button
                onClick={handleApply}
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client'

import { AnimatePresence, motion } from 'motion/react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
}

export default function Confirm({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className="relative z-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 sm:p-8 border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {title}
            </h3>
            <p className="text-base text-gray-600 mb-8 leading-relaxed">
              {message}
            </p>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-5 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-3 text-base font-medium text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  isDestructive
                    ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-500/30'
                    : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-500/30'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

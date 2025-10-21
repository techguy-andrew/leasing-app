'use client'

import { AnimatePresence, motion } from 'motion/react'
import SubmitButton from '@/components/shared/buttons/SubmitButton'

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

export default function ConfirmModal({
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
            className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-100"
          >
            {/* Accent Border */}
            <div className={`h-1.5 w-full ${
              isDestructive
                ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-500'
                : 'bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500'
            }`} />

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Icon Section */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                isDestructive
                  ? 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'
                  : 'bg-gradient-to-br from-blue-50 to-purple-100 border border-purple-200'
              }`}>
                {isDestructive ? (
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 mb-3">
                {title}
              </h3>

              {/* Message */}
              <div className={`p-4 rounded-xl mb-6 border-l-4 ${
                isDestructive
                  ? 'bg-red-50/50 border-red-500'
                  : 'bg-blue-50/50 border-blue-500'
              }`}>
                <p className="text-base text-gray-700 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  {cancelText}
                </button>
                <SubmitButton
                  onClick={onConfirm}
                  variant={isDestructive ? 'destructive' : 'primary'}
                >
                  {confirmText}
                </SubmitButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

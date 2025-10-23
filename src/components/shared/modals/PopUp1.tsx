'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import IconPack from '@/components/shared/icons/IconPack'
import { generateEmailTemplate } from './PopUp1-template'

interface Task {
  id: string
  description: string
  completed: boolean
  type: 'AGENT' | 'APPLICANT'
}

interface ApplicationData {
  applicant: string
  property: string
  propertyAddress?: string
  energyProvider?: string
  moveInDate: string
  deposit: string | null
  rent: string | null
  petFee: string | null
  rentersInsurance: string | null
  adminFee: string | null
  tasks: Task[]
}

interface PopUp1Props {
  isOpen: boolean
  applicationData: ApplicationData
  onClose: () => void
}

export default function PopUp1({
  isOpen,
  applicationData,
  onClose
}: PopUp1Props) {
  const [copied, setCopied] = useState(false)

  // Copy to clipboard
  const handleCopy = async () => {
    const emailTemplate = generateEmailTemplate(applicationData)
    try {
      await navigator.clipboard.writeText(emailTemplate)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
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
            className="relative z-10 bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden border border-gray-200"
          >

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Close Button - Top Right */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <IconPack.Cancel size="default" />
              </button>

              {/* Icon Section */}
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-5 bg-gray-100 border border-gray-200">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Applicant Status Message
              </h3>

              {/* Email Template Display */}
              <div className="p-4 rounded-lg mb-6 border border-gray-200 bg-gray-50 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap">
                  {generateEmailTemplate(applicationData)}
                </div>
              </div>

              {/* Copy Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <IconPack.Copy size="small" />
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

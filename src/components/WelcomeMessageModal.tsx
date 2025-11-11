'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import IconPack from '@/components/IconPack'
import { generateWelcomeTemplate } from '@/components/WelcomeMessageTemplate'

interface Task {
  id: string
  description: string
  completed: boolean
  type: 'AGENT' | 'APPLICANT' | 'NOTES' | 'TODO'
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
  petRent: string | null
  rentersInsurance: string | null
  adminFee: string | null
  amountPaid: string | null
  remainingBalance: string | null
  tasks: Task[]
}

interface WelcomeMessageModalProps {
  isOpen: boolean
  applicationData: ApplicationData
  onClose: () => void
}

export default function WelcomeMessageModal({
  isOpen,
  applicationData,
  onClose
}: WelcomeMessageModalProps) {
  const [copied, setCopied] = useState(false)

  // Copy to clipboard
  const handleCopy = async () => {
    const emailTemplate = generateWelcomeTemplate(applicationData)
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
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
          style={{ top: 'var(--header-height, 0px)' }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black/20 backdrop-blur-xl"
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
            className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[calc(100vh-var(--header-height,0px)-3rem)] flex flex-col border border-gray-200"
          >

            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              {/* Left: Icon + Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 border border-gray-200 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Welcome Message
                </h3>
              </div>

              {/* Right: Copy + Close Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <IconPack.Copy size="small" />
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-2"
                >
                  <IconPack.Cancel size="default" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Email Template Display */}
              <div className="p-6 rounded-lg border border-gray-200 bg-gray-50">
                <div className="text-base text-gray-700 leading-relaxed font-mono whitespace-pre-wrap">
                  {generateWelcomeTemplate(applicationData)}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

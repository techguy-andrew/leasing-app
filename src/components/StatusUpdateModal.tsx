'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import IconPack from '@/components/IconPack'
import Pill from '@/components/Pill'

interface Status {
  id: number
  name: string
  color: string
  order: number
}

interface StatusUpdateModalProps {
  isOpen: boolean
  selectedStatuses: string[]
  onStatusToggle: (status: string) => void
  onClose: () => void
}

export default function StatusUpdateModal({
  isOpen,
  selectedStatuses,
  onStatusToggle,
  onClose
}: StatusUpdateModalProps) {
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([])

  // Fetch available statuses from API
  const fetchStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/statuses', { cache: 'no-store' })
      const data = await response.json()
      if (response.ok && data.data) {
        setAvailableStatuses(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch statuses:', error)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchStatuses()
    }
  }, [isOpen, fetchStatuses])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
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
            className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[calc(100%-3rem)] flex flex-col border border-gray-200"
          >

            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              {/* Left: Icon + Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 border border-gray-200 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Select Status
                </h3>
              </div>

              {/* Right: Close Button */}
              <div className="flex items-center gap-2 flex-shrink-0">
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
              {/* Status List with Checkboxes */}
              <div className="flex flex-col gap-2">
                {availableStatuses.map((status) => {
                  const isSelected = selectedStatuses.includes(status.name)
                  return (
                    <div
                      key={status.id}
                      className="w-full px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg flex items-center gap-3 cursor-pointer border border-gray-200"
                      onClick={() => onStatusToggle(status.name)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-gray-300 pointer-events-none"
                      />
                      <Pill
                        label={status.name}
                        color={status.color}
                        variant="default"
                      />
                    </div>
                  )
                })}
              </div>

              {availableStatuses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No statuses available. Create statuses in Settings.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

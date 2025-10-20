'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface StatusOption {
  value: string
  label: string
}

interface InlineStatusBadgeProps {
  status: string
  onChange: (status: string) => void
  options: StatusOption[]
}

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800'
}

export default function InlineStatusBadge({
  status,
  onChange,
  options
}: InlineStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const badgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (badgeRef.current && !badgeRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (selectedStatus: string) => {
    onChange(selectedStatus)
    setIsOpen(false)
  }

  const displayStatus = status || 'N/A'
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800'

  return (
    <div className="relative inline-block" ref={badgeRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2 py-0.5 text-xs font-sans font-medium rounded-full hover:opacity-80 transition-opacity select-text ${colorClass}`}
      >
        {displayStatus}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
          >
            <div className="py-1">
              {options.map((option) => {
                const optionColorClass = statusColors[option.value] || 'bg-gray-100 text-gray-800'
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors font-sans"
                  >
                    <span className={`px-2 py-0.5 text-xs font-sans font-medium rounded-full ${optionColorClass}`}>
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

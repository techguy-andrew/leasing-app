'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { STATUS_BADGE_COLORS } from '@/lib/constants'

/**
 * InlineStatusBadge Component
 *
 * A clickable status badge with multi-select dropdown. Displays multiple status badges.
 * Auto-closes on outside click.
 *
 * @example
 * ```tsx
 * const STATUS_OPTIONS = [
 *   { value: 'New', label: 'New' },
 *   { value: 'Pending', label: 'Pending' },
 *   { value: 'Approved', label: 'Approved' }
 * ]
 *
 * <InlineStatusBadge
 *   status={formData.status}
 *   onChange={(value) => setFormData({ ...formData, status: value })}
 *   options={STATUS_OPTIONS}
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Update STATUS_BADGE_COLORS in constants.ts with your status types and colors
 * 2. Use Tailwind color classes (bg-blue-100 text-blue-800)
 * 3. Modify options array to match your workflow statuses
 * 4. Always clickable - no read-only mode
 * 5. Supports multiple simultaneous statuses
 */

interface StatusOption {
  value: string
  label: string
}

interface InlineStatusBadgeProps {
  status: string[]
  onChange: (status: string[]) => void
  options: StatusOption[]
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

  const handleToggle = (selectedStatus: string) => {
    if (status.includes(selectedStatus)) {
      // Remove status if already selected, but keep at least one
      if (status.length > 1) {
        onChange(status.filter(s => s !== selectedStatus))
      }
    } else {
      // Add status if not selected
      onChange([...status, selectedStatus])
    }
  }

  const displayStatuses = status.length > 0 ? status : ['N/A']

  return (
    <div className="relative inline-block" ref={badgeRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-wrap gap-1 cursor-pointer"
      >
        {displayStatuses.map((s, index) => {
          const colorClass = STATUS_BADGE_COLORS[s] || 'bg-gray-100 text-gray-800'
          return (
            <span
              key={`${s}-${index}`}
              className={`px-2 py-0.5 text-xs font-sans font-medium rounded-full hover:opacity-80 transition-opacity select-text ${colorClass}`}
            >
              {s}
            </span>
          )
        })}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
          >
            <div className="py-1">
              {options.map((option) => {
                const isSelected = status.includes(option.value)
                const optionColorClass = STATUS_BADGE_COLORS[option.value] || 'bg-gray-100 text-gray-800'
                return (
                  <button
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors font-sans flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-gray-300"
                    />
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

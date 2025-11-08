'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import IconPack from '@/components/IconPack'
import Pill from '@/components/Pill'

/**
 * 🎯 FULL-SCREEN FILTER MODAL
 *
 * Unified modal component for all filter selections.
 * Based on StatusUpdateModal and StatusMessageModal architecture.
 *
 * Features:
 * - Single or multi-select modes
 * - Static or API-fetched options
 * - Radio buttons or checkboxes
 * - Apply/Cancel or immediate selection
 * - Custom icons and titles
 * - Full-screen centered design
 * - Backdrop blur
 *
 * @example
 * ```tsx
 * <FullScreenFilterModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Select Status"
 *   icon="tag"
 *   mode="multi"
 *   options={statuses.map(s => ({ value: s.name, label: s.name, color: s.color }))}
 *   selectedValues={selectedStatuses}
 *   onApply={(values) => setSelectedStatuses(values)}
 *   showApplyButton={true}
 * />
 * ```
 */

export interface FilterOption {
  value: string
  label: string
  color?: string
}

interface FullScreenFilterModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: 'tag' | 'building' | 'calendar' | 'clock' | 'sort'
  mode: 'single' | 'multi'
  options: FilterOption[]
  selectedValues: string[]
  onApply: (values: string[]) => void
  autoCloseOnSelect?: boolean
  showApplyButton?: boolean
  fetchOptions?: () => Promise<FilterOption[]>
}

export default function FullScreenFilterModal({
  isOpen,
  onClose,
  title,
  icon = 'tag',
  mode,
  options: initialOptions,
  selectedValues,
  onApply,
  autoCloseOnSelect = false,
  showApplyButton = false,
  fetchOptions
}: FullScreenFilterModalProps) {
  const [options, setOptions] = useState<FilterOption[]>(initialOptions)
  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>(selectedValues)

  // Fetch options if needed
  useEffect(() => {
    if (isOpen && fetchOptions) {
      fetchOptions().then(setOptions)
    }
  }, [isOpen, fetchOptions])

  // Reset temp selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedValues(selectedValues)
    }
  }, [isOpen, selectedValues])

  // Update options when initialOptions change
  useEffect(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  const handleToggle = useCallback((value: string) => {
    if (mode === 'single') {
      setTempSelectedValues([value])
      if (autoCloseOnSelect) {
        onApply([value])
        onClose()
      }
    } else {
      // Multi-select with smart "All" logic
      setTempSelectedValues(prev => {
        if (value === 'All') {
          // Clicking "All" clears all other selections
          return ['All']
        } else {
          // Clicking a specific option
          if (prev.includes(value)) {
            // Deselecting a specific option
            const newSelection = prev.filter(v => v !== value)
            // If nothing left, default back to "All"
            return newSelection.length === 0 ? ['All'] : newSelection
          } else {
            // Selecting a specific option - remove "All" if present
            const withoutAll = prev.filter(v => v !== 'All')
            return [...withoutAll, value]
          }
        }
      })
    }
  }, [mode, autoCloseOnSelect, onApply, onClose])

  const handleApply = useCallback(() => {
    onApply(tempSelectedValues)
    onClose()
  }, [tempSelectedValues, onApply, onClose])

  const handleCancel = useCallback(() => {
    setTempSelectedValues(selectedValues)
    onClose()
  }, [selectedValues, onClose])

  const getIcon = () => {
    switch (icon) {
      case 'tag':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      case 'building':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      case 'calendar':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'clock':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'sort':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black/20 backdrop-blur-xl"
            onClick={handleCancel}
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
            className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-gray-200"
          >
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
              {/* Left: Icon + Title */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gray-100 border border-gray-200 flex-shrink-0">
                  {getIcon()}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  {title}
                </h3>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {showApplyButton && mode === 'multi' && (
                  <>
                    <button
                      onClick={handleApply}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {!showApplyButton && (
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer p-2"
                  >
                    <IconPack.Cancel size="default" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Options Grid - responsive columns for colored items (like statuses) */}
              <div className={`grid gap-2 ${options.length > 0 && options[0].color ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {options.map((option) => {
                  const isSelected = tempSelectedValues.includes(option.value)
                  // Gray out "All" when it's the only selection (default state) in multi-select mode
                  const isDefaultAll = mode === 'multi' && option.value === 'All' && tempSelectedValues.length === 1 && tempSelectedValues[0] === 'All'

                  return (
                    <div
                      key={option.value}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 transition-colors rounded-lg flex items-center gap-2 sm:gap-3 cursor-pointer border border-gray-200 ${isDefaultAll ? 'opacity-50' : ''}`}
                      onClick={() => handleToggle(option.value)}
                    >
                      <input
                        type={mode === 'multi' ? 'checkbox' : 'radio'}
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-gray-300 pointer-events-none flex-shrink-0"
                      />
                      {option.color ? (
                        <Pill
                          label={option.label}
                          color={option.color}
                          variant="default"
                        />
                      ) : (
                        <span className={`text-xs sm:text-sm ${isDefaultAll ? 'text-gray-400' : 'text-gray-700'}`}>{option.label}</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {options.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No options available.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

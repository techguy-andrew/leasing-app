'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

/**
 * InlineSelectField Component
 *
 * A dropdown select field with inline editing support. Auto-closes on outside click.
 * Displays as plain text when not in edit mode.
 *
 * @example
 * ```tsx
 * const PROPERTY_OPTIONS = [
 *   { value: 'property1', label: 'Property 1' },
 *   { value: 'property2', label: 'Property 2' }
 * ]
 *
 * <InlineSelectField
 *   value={formData.property}
 *   onChange={(value) => setFormData({ ...formData, property: value })}
 *   options={PROPERTY_OPTIONS}
 *   isEditMode={isEditMode}
 *   placeholder="Select property"
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Define your options array with { value, label } objects
 * 2. Use for any dropdown selection needs (properties, statuses, categories, etc.)
 * 3. Displays "N/A" when no value is selected and not in edit mode
 * 4. Customize dropdown styles (bg-white, border-gray-200) as needed
 * 5. Adjust max-height (max-h-60) for scrollable dropdowns
 */

interface InlineSelectFieldProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  isEditMode: boolean
  placeholder?: string
  className?: string
}

export default function InlineSelectField({
  value,
  onChange,
  options,
  isEditMode,
  placeholder = 'Select',
  className = ''
}: InlineSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
  }

  const selectedLabel = options.find(opt => opt.value === value)?.label || value
  const isShowingPlaceholder = !selectedLabel
  const displayValue = selectedLabel || (isEditMode ? placeholder : 'N/A')

  return (
    <div className="relative" ref={dropdownRef}>
      {isEditMode ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`text-base sm:text-lg ${isShowingPlaceholder ? 'text-gray-400' : 'text-gray-900'} bg-transparent border-none outline-none text-left font-sans p-0 cursor-pointer hover:opacity-70 ${className}`}
        >
          {displayValue}
        </button>
      ) : (
        <div className={`text-base sm:text-lg ${isShowingPlaceholder ? 'text-gray-400' : 'text-gray-900'} bg-transparent outline-none text-left font-sans p-0 cursor-text select-text ${className}`}>
          {displayValue}
        </div>
      )}

      <AnimatePresence>
        {isEditMode && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-full min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto"
          >
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm sm:text-base font-sans hover:bg-blue-50 transition-colors ${
                    option.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

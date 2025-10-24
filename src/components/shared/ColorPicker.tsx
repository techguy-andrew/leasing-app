'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface ColorPickerProps {
  selectedColor: string
  onChange: (color: string) => void
  disabled?: boolean
  className?: string
}

// Predefined color palette with Tailwind colors
const COLOR_PALETTE = [
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#EAB308', name: 'Yellow' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#8B5CF6', name: 'Violet' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#14B8A6', name: 'Teal' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#059669', name: 'Green' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#F43F5E', name: 'Rose' },
  { hex: '#A855F7', name: 'Purple' },
  { hex: '#D946EF', name: 'Fuchsia' },
  { hex: '#84CC16', name: 'Lime' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#6B7280', name: 'Grey' }
]

export default function ColorPicker({ selectedColor, onChange, disabled = false, className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleColorSelect = (color: string) => {
    onChange(color)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Color Circle Button */}
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110 hover:border-gray-400'
        }`}
        style={{ backgroundColor: selectedColor }}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      />

      {/* Color Picker Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-8 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
            style={{ width: '200px' }}
          >
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PALETTE.map((color) => (
                <motion.button
                  key={color.hex}
                  type="button"
                  onClick={() => handleColorSelect(color.hex)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    selectedColor === color.hex
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={color.name}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

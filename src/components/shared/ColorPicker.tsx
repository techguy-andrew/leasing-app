'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { colorPalette } from '@/styles/tokens'

interface ColorPickerProps {
  selectedColor: string
  onChange: (color: string) => void
  disabled?: boolean
  className?: string
}

// Use design tokens for color palette
const COLOR_PALETTE = colorPalette

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

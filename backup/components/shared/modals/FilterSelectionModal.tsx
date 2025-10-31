'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

/**
 * FilterSelectionModal Component
 *
 * A modern floating modal for selecting filter options with dynamic positioning.
 * Based on StatusSelectionModal architecture with React portals and viewport-aware positioning.
 *
 * Features:
 * - Single or multi-select modes
 * - Dynamic positioning (above/below trigger based on viewport space)
 * - React portal rendering to prevent container overflow
 * - Click-outside detection for auto-close
 * - Escape key support for accessibility
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * const triggerRef = useRef<HTMLDivElement>(null)
 *
 * <button ref={triggerRef} onClick={() => setIsOpen(true)}>Open Filter</button>
 *
 * <FilterSelectionModal
 *   isOpen={isOpen}
 *   triggerRef={triggerRef}
 *   options={['Option 1', 'Option 2', 'Option 3']}
 *   selectedOptions={['Option 1']}
 *   onOptionToggle={(option) => handleToggle(option)}
 *   onClose={() => setIsOpen(false)}
 *   multiSelect={true}
 * />
 * ```
 */

interface FilterSelectionModalProps {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  options: string[]
  selectedOptions: string[]
  onOptionToggle: (option: string) => void
  onClose: () => void
  multiSelect?: boolean
  align?: 'left' | 'right'
  offsetX?: number
  offsetY?: number
}

export default function FilterSelectionModal({
  isOpen,
  triggerRef,
  options,
  selectedOptions,
  onOptionToggle,
  onClose,
  multiSelect = false,
  align = 'left',
  offsetX = 0,
  offsetY = 8
}: FilterSelectionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'below' as 'above' | 'below' })
  const [mounted, setMounted] = useState(false)

  // Track if component is mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate optimal position based on viewport space
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !modalRef.current) return

    const calculatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect()
      const modal = modalRef.current?.getBoundingClientRect()

      if (!trigger || !modal) return

      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      // Calculate space above and below trigger
      const spaceBelow = viewportHeight - trigger.bottom
      const spaceAbove = trigger.top

      // Determine if modal should appear above or below
      const modalHeight = modal.height || 250
      const shouldPlaceAbove = spaceBelow < modalHeight && spaceAbove > spaceBelow

      // Calculate vertical position
      let top: number
      if (shouldPlaceAbove) {
        top = trigger.top + scrollY - modalHeight - offsetY
      } else {
        top = trigger.bottom + scrollY + offsetY
      }

      // Calculate horizontal position based on alignment
      let left: number
      if (align === 'right') {
        left = trigger.right + scrollX - modal.width + offsetX
      } else {
        left = trigger.left + scrollX + offsetX
      }

      // Ensure modal stays within viewport horizontally
      const rightEdge = left + modal.width
      if (rightEdge > viewportWidth + scrollX) {
        left = viewportWidth + scrollX - modal.width - 16
      }
      if (left < scrollX + 16) {
        left = scrollX + 16
      }

      setPosition({
        top: Math.max(scrollY + 16, top),
        left,
        placement: shouldPlaceAbove ? 'above' : 'below'
      })
    }

    // Initial calculation
    calculatePosition()

    // Recalculate on scroll or resize
    window.addEventListener('scroll', calculatePosition, { passive: true })
    window.addEventListener('resize', calculatePosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', calculatePosition)
      window.removeEventListener('resize', calculatePosition)
    }
  }, [isOpen, triggerRef, align, offsetX, offsetY])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    // Small delay to prevent immediate close from trigger click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, triggerRef])

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{
            opacity: 0,
            scale: 0.95,
            y: position.placement === 'below' ? -8 : 8
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: position.placement === 'below' ? -8 : 8
          }}
          transition={{
            duration: 0.15,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999
          }}
          className="min-w-[12rem] w-max max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="py-1">
            {options.map((option) => {
              const isSelected = selectedOptions.includes(option)
              return (
                <div
                  key={option}
                  className="w-full px-3 py-2 hover:bg-gray-50 transition-colors font-sans flex items-center gap-2 cursor-pointer"
                  onClick={() => onOptionToggle(option)}
                >
                  {multiSelect ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                    />
                  ) : (
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                    />
                  )}
                  <span className="text-sm text-gray-700">{option}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

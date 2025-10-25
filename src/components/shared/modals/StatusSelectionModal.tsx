'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import Pill from '@/components/shared/Pill'

/**
 * StatusSelectionModal Component
 *
 * A modern floating modal for selecting multiple statuses with dynamic positioning.
 * Based on OptionsModal architecture with React portals and viewport-aware positioning.
 *
 * Features:
 * - Multi-select status with checkboxes
 * - Dynamic positioning (above/below trigger based on viewport space)
 * - React portal rendering to prevent container overflow
 * - Click-outside detection for auto-close
 * - Escape key support for accessibility
 * - Fetches available statuses from /api/statuses
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * const badgeRef = useRef<HTMLDivElement>(null)
 *
 * <div ref={badgeRef} onClick={() => setIsOpen(true)}>Status Badge</div>
 *
 * <StatusSelectionModal
 *   isOpen={isOpen}
 *   triggerRef={badgeRef}
 *   selectedStatuses={['New', 'Pending']}
 *   onStatusToggle={(status) => handleToggle(status)}
 *   onClose={() => setIsOpen(false)}
 * />
 * ```
 */

interface StatusOption {
  id: string
  name: string
  color: string
  order: number
}

interface StatusSelectionModalProps {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  selectedStatuses: string[]
  onStatusToggle: (status: string) => void
  onClose: () => void
  align?: 'left' | 'right'
  offsetX?: number
  offsetY?: number
}

export default function StatusSelectionModal({
  isOpen,
  triggerRef,
  selectedStatuses,
  onStatusToggle,
  onClose,
  align = 'left',
  offsetX = 0,
  offsetY = 8
}: StatusSelectionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'below' as 'above' | 'below' })
  const [mounted, setMounted] = useState(false)
  const [availableStatuses, setAvailableStatuses] = useState<StatusOption[]>([])

  // Track if component is mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch available statuses from API
  useEffect(() => {
    async function fetchStatuses() {
      try {
        const response = await fetch('/api/statuses', { cache: 'no-store' })
        const data = await response.json()
        if (response.ok && data.data.length > 0) {
          setAvailableStatuses(data.data)
        } else {
          // Fallback: create mock status objects for legacy statuses
          const legacyStatuses: StatusOption[] = [
            { id: 'new', name: 'New', color: '#3B82F6', order: 0 },
            { id: 'pending', name: 'Pending', color: '#EAB308', order: 1 },
            { id: 'approved', name: 'Approved', color: '#10B981', order: 2 },
            { id: 'rejected', name: 'Rejected', color: '#EF4444', order: 3 },
            { id: 'tasks', name: 'Outstanding Tasks', color: '#F59E0B', order: 4 },
            { id: 'ready', name: 'Ready for Move-In', color: '#14B8A6', order: 5 },
            { id: 'archived', name: 'Archived', color: '#64748B', order: 6 }
          ]
          setAvailableStatuses(legacyStatuses)
        }
      } catch (error) {
        console.error('Failed to fetch statuses:', error)
        // Set fallback on error
        const legacyStatuses: StatusOption[] = [
          { id: 'new', name: 'New', color: '#3B82F6', order: 0 },
          { id: 'pending', name: 'Pending', color: '#EAB308', order: 1 },
          { id: 'approved', name: 'Approved', color: '#10B981', order: 2 },
          { id: 'rejected', name: 'Rejected', color: '#EF4444', order: 3 },
          { id: 'tasks', name: 'Outstanding Tasks', color: '#F59E0B', order: 4 },
          { id: 'ready', name: 'Ready for Move-In', color: '#14B8A6', order: 5 },
          { id: 'archived', name: 'Archived', color: '#64748B', order: 6 }
        ]
        setAvailableStatuses(legacyStatuses)
      }
    }

    // Fetch when modal opens
    if (isOpen) {
      fetchStatuses()
    }
  }, [isOpen])

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
      const modalHeight = modal.height || 300 // Estimated height if not yet rendered
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
        left = viewportWidth + scrollX - modal.width - 16 // 16px padding from edge
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
            {availableStatuses.map((status) => {
              const isSelected = selectedStatuses.includes(status.name)
              return (
                <div
                  key={status.id}
                  className="w-full px-3 py-1.5 hover:bg-gray-50 transition-colors font-sans flex items-center gap-2 cursor-pointer"
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
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

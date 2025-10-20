'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'

/**
 * EditMenuButton Component
 *
 * A dropdown menu button with Edit and Delete options. Auto-closes on outside click.
 *
 * @example
 * ```tsx
 * <EditMenuButton onEdit={handleEdit} onDelete={handleDelete} />
 * ```
 *
 * To adapt for new projects:
 * 1. Replace /menu-dots-circle.svg with your own icon path
 * 2. Modify menu items (currently Edit/Delete) in the dropdown
 * 3. Adjust animation timing (duration: 0.12) as needed
 * 4. Customize menu item colors and styles
 * 5. Add more menu options by copying the button pattern
 */

interface EditMenuProps {
  onEdit: () => void
  onDelete: () => void
}

export default function EditMenuButton({ onEdit, onDelete }: EditMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleEdit = () => {
    setIsOpen(false)
    onEdit()
  }

  const handleDelete = () => {
    setIsOpen(false)
    onDelete()
  }

  return (
    <div className="relative inline-block ml-auto" ref={menuRef}>
      <Image
        src="/menu-dots-circle.svg"
        alt="Menu"
        width={32}
        height={32}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 cursor-pointer"
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute right-0 mt-[3%] min-w-[13rem] w-max max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="py-[3%]">
              <button
                onClick={handleEdit}
                className="flex items-center gap-[5%] w-full px-[5%] py-[4%] text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Application
              </button>
              <div className="border-t border-gray-200" />
              <button
                onClick={handleDelete}
                className="flex items-center gap-[5%] w-full px-[5%] py-[4%] text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors text-left whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Application
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

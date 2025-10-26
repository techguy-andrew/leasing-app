'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

/**
 * SearchModal Component
 *
 * A dropdown modal that displays search results for applications.
 * Positioned underneath the search box with hyperlinks to application detail pages.
 *
 * @example
 * ```tsx
 * <SearchModal
 *   isOpen={true}
 *   results={filteredApplications}
 *   onClose={() => setIsOpen(false)}
 *   searchTerm="John"
 * />
 * ```
 */

interface Application {
  id: number
  applicant: string
  unitNumber: string
  property: string
  status: string
}

interface SearchModalProps {
  isOpen: boolean
  results: Application[]
  onClose: () => void
  searchTerm: string
}

export default function SearchModal({ isOpen, results, onClose, searchTerm }: SearchModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Check if click is not on the search input
        const target = event.target as HTMLElement
        if (!target.closest('[data-search-box]')) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          style={{
            top: 'calc(var(--topbar-height, 0px) + var(--searchbox-height, 0px) + 8px)'
          }}
        >
          {results.length === 0 ? (
            <div className="px-4 py-3 text-[10pt] text-gray-500">
              No results found for &quot;{searchTerm}&quot;
            </div>
          ) : (
            <div className="py-2">
              {results.map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  onClick={onClose}
                  className="block px-4 py-2 text-[10pt] text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-900">{app.applicant}</span>
                      <span className="text-gray-500">
                        Unit {app.unitNumber} • {app.property}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs ml-4">{app.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

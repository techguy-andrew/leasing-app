'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import SearchModal from './SearchModal'
import { fadeIn } from '@/lib/animations/variants'

/**
 * SearchBox Component
 *
 * A search input field for filtering applications by name or unit number.
 * Displays results in a dropdown modal underneath the search box.
 * Fetches all applications independently to search across the entire dataset.
 *
 * @example
 * ```tsx
 * <SearchBox />
 * ```
 */

interface Application {
  id: number
  applicant: string
  unitNumber: string
  property: string
  status: string
}

export default function SearchBox() {
  const [applications, setApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Application[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch all applications for searching
  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch('/api/applications')
        const data = await response.json()

        if (response.ok) {
          setApplications(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch applications for search:', err)
      }
    }

    loadApplications()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Perform search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setSearchResults([])
      setIsModalOpen(false)
      return
    }

    const term = debouncedSearchTerm.toLowerCase()
    const results = applications.filter((app) => {
      const applicantMatch = app.applicant.toLowerCase().includes(term)
      const unitMatch = app.unitNumber.toLowerCase().includes(term)
      return applicantMatch || unitMatch
    })

    setSearchResults(results)
    setIsModalOpen(true)
  }, [debouncedSearchTerm, applications])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleFocus = useCallback(() => {
    if (debouncedSearchTerm.trim() !== '') {
      setIsModalOpen(true)
    }
  }, [debouncedSearchTerm])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return (
    <>
      {/* Backdrop overlay - covers FilterBar too */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/20 backdrop-blur-xl"
            style={{ zIndex: 35 }}
            onClick={handleModalClose}
          />
        )}
      </AnimatePresence>

      <motion.div
        data-searchbox
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="fixed left-0 right-0 w-full px-4 sm:px-6 py-3 bg-white border-b border-gray-200 z-40"
        style={{ top: 'var(--topbar-height, 0px)' }}
      >
        <div className="max-w-2xl mx-auto" data-search-box>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              placeholder="Search by name or unit number..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setIsModalOpen(false)
                  searchInputRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search Modal - positioned below search bar */}
      <SearchModal
        isOpen={isModalOpen}
        results={searchResults}
        onClose={handleModalClose}
        searchTerm={debouncedSearchTerm}
      />
    </>
  )
}

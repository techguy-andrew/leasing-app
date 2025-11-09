'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { fadeIn } from '@/lib/animations/variants'

/**
 * GenericSearchBar Component
 *
 * A configurable search component that displays a search input field
 * and shows results in a dropdown modal. Supports any data type through configuration.
 *
 * @example
 * ```tsx
 * <GenericSearchBar<Application>
 *   apiEndpoint="/api/applications"
 *   placeholder="Search by name or unit number..."
 *   searchFields={(item, term) =>
 *     item.applicant.toLowerCase().includes(term) ||
 *     item.unitNumber.toLowerCase().includes(term)
 *   }
 *   filterResults={(item) => !item.status.includes('Archived')}
 *   renderResult={(item) => (
 *     <>
 *       <span className="font-medium text-gray-900">{item.applicant}</span>
 *       <span className="text-gray-500">Unit {item.unitNumber} • {item.property}</span>
 *     </>
 *   )}
 *   getResultLink={(item) => `/applications/${item.id}`}
 *   getResultMeta={(item) => item.status.join(', ')}
 * />
 * ```
 */

interface GenericSearchBarProps<T> {
  /** API endpoint to fetch all data from */
  apiEndpoint: string
  /** Placeholder text for the search input */
  placeholder: string
  /** Function to determine if an item matches the search term */
  searchFields: (item: T, searchTerm: string) => boolean
  /** Optional function to filter results (e.g., exclude archived items) */
  filterResults?: (item: T) => boolean
  /** Function to render the main content of each result */
  renderResult: (item: T) => React.ReactNode
  /** Function to generate the link URL for each result */
  getResultLink: (item: T) => string
  /** Optional function to render metadata (shown on the right side) */
  getResultMeta?: (item: T) => string
  /** Function to extract the item ID for the key prop */
  getItemId: (item: T) => string | number
}

export default function GenericSearchBar<T>({
  apiEndpoint,
  placeholder,
  searchFields,
  filterResults,
  renderResult,
  getResultLink,
  getResultMeta,
  getItemId
}: GenericSearchBarProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<T[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Fetch all items for searching
  useEffect(() => {
    async function loadItems() {
      try {
        const response = await fetch(apiEndpoint)
        const data = await response.json()

        if (response.ok) {
          setItems(data.data)
        }
      } catch (err) {
        console.error(`Failed to fetch items from ${apiEndpoint}:`, err)
      }
    }

    loadItems()
  }, [apiEndpoint])

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
    const results = items.filter((item) => {
      // Apply custom filter if provided
      if (filterResults && !filterResults(item)) {
        return false
      }

      // Apply search fields
      return searchFields(item, term)
    })

    setSearchResults(results)
    setIsModalOpen(true)
  }, [debouncedSearchTerm, items, searchFields, filterResults])

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

  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
    setIsModalOpen(false)
    searchInputRef.current?.focus()
  }, [])

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Check if click is not on the search input
        const target = event.target as HTMLElement
        if (!target.closest('[data-search-box]')) {
          handleModalClose()
        }
      }
    }

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isModalOpen, handleModalClose])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleModalClose()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [isModalOpen, handleModalClose])

  return (
    <>
      {/* Backdrop overlay */}
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

      {/* Search input bar */}
      <motion.div
        data-searchbox
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="w-full px-4 sm:px-6 py-3 bg-white border-b border-gray-200"
      >
        <div className="max-w-2xl mx-auto" data-search-box style={{ position: 'relative', zIndex: 40 }}>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              placeholder={placeholder}
              className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
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

      {/* Search results modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
            style={{
              top: '12rem',
              zIndex: 45
            }}
          >
            {searchResults.length === 0 ? (
              <div className="px-4 py-3 text-[10pt] text-gray-500">
                No results found for &quot;{debouncedSearchTerm}&quot;
              </div>
            ) : (
              <div className="py-2">
                {searchResults.map((item) => (
                  <Link
                    key={getItemId(item)}
                    href={getResultLink(item)}
                    onClick={handleModalClose}
                    className="block px-4 py-2 text-[10pt] text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        {renderResult(item)}
                      </div>
                      {getResultMeta && (
                        <span className="text-gray-400 text-xs ml-4">{getResultMeta(item)}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

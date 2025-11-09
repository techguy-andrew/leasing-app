'use client'

import { useState, useEffect, useRef } from 'react'
import FilterDropdown, { FilterOption } from '@/components/FilterDropdown'

/**
 * FilterBar Component (Redesigned)
 *
 * A clean, pill-based filter bar with dropdown menus for filtering and sorting applications.
 * Uses the same Pill component as ApplicationListItem for consistency.
 */

interface FilterBarProps {
  statusFilter: string[]
  onStatusChange: (status: string[]) => void
  dateType: 'moveIn' | 'application'
  onDateTypeChange: (type: 'moveIn' | 'application') => void
  calendarFilter: string
  onCalendarChange: (filter: string) => void
  propertyFilter: string[]
  onPropertyChange: (property: string[]) => void
  sortDirection: 'asc' | 'desc'
  onSortDirectionChange: (direction: 'asc' | 'desc') => void
}

const dateTypeOptions: FilterOption[] = [
  { value: 'moveIn', label: 'Move-In Date' },
  { value: 'application', label: 'Application Date' }
]

const calendarOptions: FilterOption[] = [
  { value: 'All Time', label: 'All Time' },
  { value: 'This Week', label: 'This Week' },
  { value: 'This Month', label: 'This Month' }
]

const sortOptions: FilterOption[] = [
  { value: 'asc', label: 'Earliest First' },
  { value: 'desc', label: 'Latest First' }
]

export default function FilterBar({
  statusFilter,
  onStatusChange,
  dateType,
  onDateTypeChange,
  calendarFilter,
  onCalendarChange,
  propertyFilter,
  onPropertyChange,
  sortDirection,
  onSortDirectionChange
}: FilterBarProps) {
  const [statusOptions, setStatusOptions] = useState<FilterOption[]>([{ value: 'All', label: 'All' }])
  const [propertyOptions, setPropertyOptions] = useState<FilterOption[]>([{ value: 'All', label: 'All' }])

  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false)
  const [dateTypeDropdownOpen, setDateTypeDropdownOpen] = useState(false)
  const [calendarDropdownOpen, setCalendarDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  // Refs for pill buttons (to position dropdowns)
  const statusPillRef = useRef<HTMLButtonElement>(null)
  const propertyPillRef = useRef<HTMLButtonElement>(null)
  const dateTypePillRef = useRef<HTMLButtonElement>(null)
  const calendarPillRef = useRef<HTMLButtonElement>(null)
  const sortPillRef = useRef<HTMLButtonElement>(null)

  // Fetch statuses from database
  const fetchStatusOptions = async (): Promise<FilterOption[]> => {
    try {
      const response = await fetch('/api/statuses', { cache: 'no-store' })
      const data = await response.json()

      if (response.ok && data.success) {
        const statuses = data.data.map((status: { name: string; color: string }) => ({
          value: status.name,
          label: status.name,
          color: status.color
        }))
        return [{ value: 'All', label: 'All' }, ...statuses]
      }
    } catch (error) {
      console.error('Failed to fetch statuses:', error)
    }
    return [{ value: 'All', label: 'All' }]
  }

  // Fetch properties from database
  const fetchPropertyOptions = async (): Promise<FilterOption[]> => {
    try {
      const response = await fetch('/api/properties')
      const data = await response.json()

      if (response.ok && data.success) {
        const properties = data.data.map((property: { name: string }) => ({
          value: property.name,
          label: property.name
        }))
        return [{ value: 'All', label: 'All' }, ...properties]
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    }
    return [{ value: 'All', label: 'All' }]
  }

  // Initialize options on mount
  useEffect(() => {
    fetchStatusOptions().then(setStatusOptions)
    fetchPropertyOptions().then(setPropertyOptions)
  }, [])

  // Handlers
  const handleStatusApply = (values: string[]) => {
    onStatusChange(values)
    setStatusDropdownOpen(false)
  }

  const handlePropertyApply = (values: string[]) => {
    onPropertyChange(values)
    setPropertyDropdownOpen(false)
  }

  const handleDateTypeApply = (values: string[]) => {
    const type = values[0] as 'moveIn' | 'application'
    onDateTypeChange(type)
    setDateTypeDropdownOpen(false)
  }

  const handleCalendarApply = (values: string[]) => {
    onCalendarChange(values[0] || 'All Time')
    setCalendarDropdownOpen(false)
  }

  const handleSortApply = (values: string[]) => {
    const direction = values[0] as 'asc' | 'desc'
    onSortDirectionChange(direction)
    setSortDropdownOpen(false)
  }

  // Get display labels
  const getStatusLabel = () => {
    if (statusFilter.includes('All') || statusFilter.length === 0) return 'Status: All'
    if (statusFilter.length === 1) return `Status: ${statusFilter[0]}`
    return `Status: ${statusFilter.length} selected`
  }

  const getPropertyLabel = () => {
    if (propertyFilter.includes('All') || propertyFilter.length === 0) return 'Property: All'
    if (propertyFilter.length === 1) return `Property: ${propertyFilter[0]}`
    return `Property: ${propertyFilter.length} selected`
  }

  const getDateTypeLabel = () => {
    return dateTypeOptions.find(opt => opt.value === dateType)?.label || 'Move-In Date'
  }

  const getSortLabel = () => {
    return sortDirection === 'asc' ? 'Sort: Earliest First' : 'Sort: Latest First'
  }

  return (
    <div
      data-filterbar
      className="w-full flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200"
    >
      {/* Status Filter Pill */}
      <button
        ref={statusPillRef}
        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getStatusLabel()}
      </button>

      {/* Property Filter Pill */}
      <button
        ref={propertyPillRef}
        onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getPropertyLabel()}
      </button>

      {/* Date Type Pill */}
      <button
        ref={dateTypePillRef}
        onClick={() => setDateTypeDropdownOpen(!dateTypeDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getDateTypeLabel()}
      </button>

      {/* Calendar Filter Pill */}
      <button
        ref={calendarPillRef}
        onClick={() => setCalendarDropdownOpen(!calendarDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {calendarFilter}
      </button>

      {/* Sort Pill */}
      <button
        ref={sortPillRef}
        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getSortLabel()}
      </button>

      {/* Dropdowns */}
      <FilterDropdown
        isOpen={statusDropdownOpen}
        onClose={() => setStatusDropdownOpen(false)}
        triggerRef={statusPillRef}
        mode="multi"
        options={statusOptions}
        selectedValues={statusFilter}
        onApply={handleStatusApply}
        showApplyButton={true}
        fetchOptions={fetchStatusOptions}
      />

      <FilterDropdown
        isOpen={propertyDropdownOpen}
        onClose={() => setPropertyDropdownOpen(false)}
        triggerRef={propertyPillRef}
        mode="multi"
        options={propertyOptions}
        selectedValues={propertyFilter}
        onApply={handlePropertyApply}
        showApplyButton={true}
        fetchOptions={fetchPropertyOptions}
      />

      <FilterDropdown
        isOpen={dateTypeDropdownOpen}
        onClose={() => setDateTypeDropdownOpen(false)}
        triggerRef={dateTypePillRef}
        mode="single"
        options={dateTypeOptions}
        selectedValues={[dateType]}
        onApply={handleDateTypeApply}
        autoCloseOnSelect={true}
      />

      <FilterDropdown
        isOpen={calendarDropdownOpen}
        onClose={() => setCalendarDropdownOpen(false)}
        triggerRef={calendarPillRef}
        mode="single"
        options={calendarOptions}
        selectedValues={[calendarFilter]}
        onApply={handleCalendarApply}
        autoCloseOnSelect={true}
      />

      <FilterDropdown
        isOpen={sortDropdownOpen}
        onClose={() => setSortDropdownOpen(false)}
        triggerRef={sortPillRef}
        mode="single"
        options={sortOptions}
        selectedValues={[sortDirection]}
        onApply={handleSortApply}
        autoCloseOnSelect={true}
      />
    </div>
  )
}

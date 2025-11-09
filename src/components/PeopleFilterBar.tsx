'use client'

import { useState, useRef, useMemo } from 'react'
import FilterDropdown from './FilterDropdown'

interface PeopleFilterBarProps {
  // Available filter options
  statuses: string[]

  // Filter state
  statusFilter: string[]
  onStatusChange: (statuses: string[]) => void

  // Sort state
  sortField: 'name' | 'status' | 'createdAt'
  onSortFieldChange: (field: 'name' | 'status' | 'createdAt') => void
  sortDirection: 'asc' | 'desc'
  onSortDirectionChange: (direction: 'asc' | 'desc') => void
}

export default function PeopleFilterBar({
  statuses,
  statusFilter,
  onStatusChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange
}: PeopleFilterBarProps) {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [sortFieldDropdownOpen, setSortFieldDropdownOpen] = useState(false)
  const [sortDirectionDropdownOpen, setSortDirectionDropdownOpen] = useState(false)

  const statusPillRef = useRef<HTMLButtonElement>(null)
  const sortFieldPillRef = useRef<HTMLButtonElement>(null)
  const sortDirectionPillRef = useRef<HTMLButtonElement>(null)

  // Get status label for pill
  const getStatusLabel = () => {
    if (statusFilter.length === 0) return 'Status'
    if (statusFilter.length === 1) return `Status: ${statusFilter[0]}`
    return `Status: ${statusFilter.length} selected`
  }

  // Get sort field label
  const getSortFieldLabel = () => {
    const labels = {
      name: 'Sort: Name',
      status: 'Sort: Status',
      createdAt: 'Sort: Date Added'
    }
    return labels[sortField]
  }

  // Get sort direction label
  const getSortDirectionLabel = () => {
    return sortDirection === 'asc' ? 'A → Z' : 'Z → A'
  }

  // Status options for dropdown
  const statusOptions = useMemo(() =>
    statuses.map(status => ({ value: status, label: status })),
    [statuses]
  )

  // Sort field options
  const sortFieldOptions = [
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'createdAt', label: 'Date Added' }
  ]

  // Sort direction options
  const sortDirectionOptions = [
    { value: 'asc', label: 'Ascending (A → Z)' },
    { value: 'desc', label: 'Descending (Z → A)' }
  ]

  return (
    <div className="w-full px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter */}
        <button
          ref={statusPillRef}
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {getStatusLabel()}
        </button>
        <FilterDropdown
          isOpen={statusDropdownOpen}
          onClose={() => setStatusDropdownOpen(false)}
          triggerRef={statusPillRef}
          mode="multi"
          options={statusOptions}
          selectedValues={statusFilter}
          onApply={(values) => onStatusChange(values)}
        />

        {/* Sort Field */}
        <button
          ref={sortFieldPillRef}
          onClick={() => setSortFieldDropdownOpen(!sortFieldDropdownOpen)}
          className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {getSortFieldLabel()}
        </button>
        <FilterDropdown
          isOpen={sortFieldDropdownOpen}
          onClose={() => setSortFieldDropdownOpen(false)}
          triggerRef={sortFieldPillRef}
          mode="single"
          options={sortFieldOptions}
          selectedValues={[sortField]}
          onApply={(values) => onSortFieldChange(values[0] as 'name' | 'status' | 'createdAt')}
          autoCloseOnSelect={true}
        />

        {/* Sort Direction */}
        <button
          ref={sortDirectionPillRef}
          onClick={() => setSortDirectionDropdownOpen(!sortDirectionDropdownOpen)}
          className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {getSortDirectionLabel()}
        </button>
        <FilterDropdown
          isOpen={sortDirectionDropdownOpen}
          onClose={() => setSortDirectionDropdownOpen(false)}
          triggerRef={sortDirectionPillRef}
          mode="single"
          options={sortDirectionOptions}
          selectedValues={[sortDirection]}
          onApply={(values) => onSortDirectionChange(values[0] as 'asc' | 'desc')}
          autoCloseOnSelect={true}
        />
      </div>
    </div>
  )
}

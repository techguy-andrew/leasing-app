'use client'

import { useState, useRef, useMemo } from 'react'
import FilterDropdown from './FilterDropdown'

interface PropertiesFilterBarProps {
  // Available filter options
  cities: string[]
  states: string[]

  // Filter state
  cityFilter: string[]
  onCityChange: (cities: string[]) => void
  stateFilter: string[]
  onStateChange: (states: string[]) => void

  // Sort state
  sortField: 'name' | 'city' | 'createdAt'
  onSortFieldChange: (field: 'name' | 'city' | 'createdAt') => void
  sortDirection: 'asc' | 'desc'
  onSortDirectionChange: (direction: 'asc' | 'desc') => void
}

export default function PropertiesFilterBar({
  cities,
  states,
  cityFilter,
  onCityChange,
  stateFilter,
  onStateChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange
}: PropertiesFilterBarProps) {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
  const [sortFieldDropdownOpen, setSortFieldDropdownOpen] = useState(false)
  const [sortDirectionDropdownOpen, setSortDirectionDropdownOpen] = useState(false)

  const cityPillRef = useRef<HTMLButtonElement>(null)
  const statePillRef = useRef<HTMLButtonElement>(null)
  const sortFieldPillRef = useRef<HTMLButtonElement>(null)
  const sortDirectionPillRef = useRef<HTMLButtonElement>(null)

  // Get city label for pill
  const getCityLabel = () => {
    if (cityFilter.length === 0) return 'City'
    if (cityFilter.length === 1) return `City: ${cityFilter[0]}`
    return `City: ${cityFilter.length} selected`
  }

  // Get state label for pill
  const getStateLabel = () => {
    if (stateFilter.length === 0) return 'State'
    if (stateFilter.length === 1) return `State: ${stateFilter[0]}`
    return `State: ${stateFilter.length} selected`
  }

  // Get sort field label
  const getSortFieldLabel = () => {
    const labels = {
      name: 'Sort: Name',
      city: 'Sort: City',
      createdAt: 'Sort: Date Added'
    }
    return labels[sortField]
  }

  // Get sort direction label
  const getSortDirectionLabel = () => {
    return sortDirection === 'asc' ? 'A → Z' : 'Z → A'
  }

  // City options for dropdown
  const cityOptions = useMemo(() =>
    cities.map(city => ({ value: city, label: city })),
    [cities]
  )

  // State options for dropdown
  const stateOptions = useMemo(() =>
    states.map(state => ({ value: state, label: state })),
    [states]
  )

  // Sort field options
  const sortFieldOptions = [
    { value: 'name', label: 'Name' },
    { value: 'city', label: 'City' },
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
        {/* City Filter */}
        <button
          ref={cityPillRef}
          onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
          className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {getCityLabel()}
        </button>
        <FilterDropdown
          isOpen={cityDropdownOpen}
          onClose={() => setCityDropdownOpen(false)}
          triggerRef={cityPillRef}
          mode="multi"
          options={cityOptions}
          selectedValues={cityFilter}
          onApply={(values) => onCityChange(values)}
        />

        {/* State Filter */}
        <button
          ref={statePillRef}
          onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
          className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {getStateLabel()}
        </button>
        <FilterDropdown
          isOpen={stateDropdownOpen}
          onClose={() => setStateDropdownOpen(false)}
          triggerRef={statePillRef}
          mode="multi"
          options={stateOptions}
          selectedValues={stateFilter}
          onApply={(values) => onStateChange(values)}
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
          onApply={(values) => onSortFieldChange(values[0] as 'name' | 'city' | 'createdAt')}
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

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUnitsFilter } from '@/contexts/UnitsFilterContext'
import FullScreenFilterModal, { FilterOption } from '@/components/FullScreenFilterModal'
import PriceRangeFilterModal from '@/components/PriceRangeFilterModal'
import DateFilterModal from '@/components/DateFilterModal'

const bedroomsOptions: FilterOption[] = [
  { value: 'All', label: 'All' },
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4+', label: '4+' }
]

const statusOptions: FilterOption[] = [
  { value: 'All', label: 'All' },
  { value: 'Vacant', label: 'Vacant', color: '#10B981' },
  { value: 'Occupied', label: 'Occupied', color: '#3B82F6' },
  { value: 'Under Maintenance', label: 'Under Maintenance', color: '#F59E0B' },
  { value: 'Reserved', label: 'Reserved', color: '#8B5CF6' }
]

const sortFieldOptions: FilterOption[] = [
  { value: 'unitNumber', label: 'Unit Number' },
  { value: 'bedrooms', label: 'Bedrooms' },
  { value: 'price', label: 'Price' },
  { value: 'property', label: 'Property' },
  { value: 'availableOn', label: 'Available On' }
]

const sortDirectionOptions: FilterOption[] = [
  { value: 'asc', label: 'A → Z' },
  { value: 'desc', label: 'Z → A' }
]

export default function UnitsFilterBar() {
  const {
    propertyFilter,
    setPropertyFilter,
    bedroomsFilter,
    setBedroomsFilter,
    statusFilter,
    setStatusFilter,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    availableByDate,
    setAvailableByDate,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection
  } = useUnitsFilter()

  const [propertyOptions, setPropertyOptions] = useState<FilterOption[]>([{ value: 'All', label: 'All' }])
  const [isExpanded, setIsExpanded] = useState(true)

  // Modal states
  const [propertyModalOpen, setPropertyModalOpen] = useState(false)
  const [bedroomsModalOpen, setBedroomsModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [priceModalOpen, setPriceModalOpen] = useState(false)
  const [availableByModalOpen, setAvailableByModalOpen] = useState(false)
  const [sortFieldModalOpen, setSortFieldModalOpen] = useState(false)
  const [sortDirectionModalOpen, setSortDirectionModalOpen] = useState(false)

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

  // Initialize property options on mount
  useEffect(() => {
    fetchPropertyOptions().then(setPropertyOptions)
  }, [])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (propertyFilter.length > 0 && !propertyFilter.includes('All')) count++
    if (bedroomsFilter.length > 0 && !bedroomsFilter.includes('All')) count++
    if (statusFilter.length > 0 && !statusFilter.includes('All')) count++
    if (minPrice || maxPrice) count++
    if (availableByDate) count++
    if (sortField !== 'property') count++
    if (sortDirection !== 'asc') count++
    return count
  }, [propertyFilter, bedroomsFilter, statusFilter, minPrice, maxPrice, availableByDate, sortField, sortDirection])

  // Clear all filters
  const handleClearFilters = () => {
    setPropertyFilter(['All'])
    setBedroomsFilter(['All'])
    setStatusFilter(['All'])
    setMinPrice('')
    setMaxPrice('')
    setAvailableByDate('')
    setSortField('property')
    setSortDirection('asc')
  }

  // Handle filter changes
  const handlePropertyApply = (values: string[]) => {
    setPropertyFilter(values)
    setPropertyModalOpen(false)
  }

  const handleBedroomsApply = (values: string[]) => {
    setBedroomsFilter(values)
    setBedroomsModalOpen(false)
  }

  const handleStatusApply = (values: string[]) => {
    setStatusFilter(values)
    setStatusModalOpen(false)
  }

  const handlePriceApply = (min: string, max: string) => {
    setMinPrice(min)
    setMaxPrice(max)
    setPriceModalOpen(false)
  }

  const handleAvailableByApply = (date: string) => {
    setAvailableByDate(date)
    setAvailableByModalOpen(false)
  }

  const handleSortFieldApply = (values: string[]) => {
    const field = values[0] as 'unitNumber' | 'bedrooms' | 'price' | 'property' | 'availableOn'
    setSortField(field)
    setSortFieldModalOpen(false)
  }

  const handleSortDirectionApply = (values: string[]) => {
    const direction = values[0] as 'asc' | 'desc'
    setSortDirection(direction)
    setSortDirectionModalOpen(false)
  }

  // Get display labels
  const getPropertyLabel = () => {
    if (propertyFilter.includes('All') || propertyFilter.length === 0) return 'All'
    if (propertyFilter.length === 1) return propertyFilter[0]
    return `${propertyFilter.length} selected`
  }

  const getBedroomsLabel = () => {
    if (bedroomsFilter.includes('All') || bedroomsFilter.length === 0) return 'All'
    if (bedroomsFilter.length === 1) return bedroomsFilter[0]
    return `${bedroomsFilter.length} selected`
  }

  const getStatusLabel = () => {
    if (statusFilter.includes('All') || statusFilter.length === 0) return 'All'
    if (statusFilter.length === 1) return statusFilter[0]
    return `${statusFilter.length} selected`
  }

  const getPriceLabel = () => {
    if (!minPrice && !maxPrice) return 'Any'
    if (minPrice && maxPrice) return `$${minPrice} - $${maxPrice}`
    if (minPrice) return `>= $${minPrice}`
    if (maxPrice) return `<= $${maxPrice}`
    return 'Any'
  }

  const getAvailableByLabel = () => {
    if (!availableByDate) return 'Any Date'
    const date = new Date(availableByDate)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getSortFieldLabel = () => {
    return sortFieldOptions.find(opt => opt.value === sortField)?.label || 'Property'
  }

  const getSortDirectionLabel = () => {
    return sortDirectionOptions.find(opt => opt.value === sortDirection)?.label || 'A → Z'
  }

  return (
    <div
      data-unitsfilterbar
      className="w-full h-fit flex flex-col px-6 py-3 bg-white border-b border-gray-200"
    >
      {/* Header Row */}
      <div className="flex items-center gap-3">
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Filters
        </button>

        {/* Active Filter Count */}
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {activeFilterCount} active
          </span>
        )}

        {/* Clear All Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="ml-auto px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Options */}
      {isExpanded && (
        <div className="flex gap-3 items-center flex-wrap mt-3">
          {/* Property Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Property
            </label>
            <button
              onClick={() => setPropertyModalOpen(!propertyModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{getPropertyLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Bedrooms Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Bedrooms
            </label>
            <button
              onClick={() => setBedroomsModalOpen(!bedroomsModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{getBedroomsLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </label>
            <button
              onClick={() => setStatusModalOpen(!statusModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{getStatusLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Price Range
            </label>
            <button
              onClick={() => setPriceModalOpen(!priceModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{getPriceLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Available By Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Available By
            </label>
            <button
              onClick={() => setAvailableByModalOpen(!availableByModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[160px]"
            >
              <span className="flex-1 text-left">{getAvailableByLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Sort Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Sort By
            </label>
            <button
              onClick={() => setSortFieldModalOpen(!sortFieldModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{getSortFieldLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Sort Direction */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Direction
            </label>
            <button
              onClick={() => setSortDirectionModalOpen(!sortDirectionModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[120px]"
            >
              <span className="flex-1 text-left">{getSortDirectionLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Property Filter Modal */}
      <FullScreenFilterModal
        isOpen={propertyModalOpen}
        onClose={() => setPropertyModalOpen(false)}
        title="Filter by Property"
        icon="building"
        mode="multi"
        options={propertyOptions}
        selectedValues={propertyFilter}
        onApply={handlePropertyApply}
        showApplyButton={true}
        fetchOptions={fetchPropertyOptions}
      />

      {/* Bedrooms Filter Modal */}
      <FullScreenFilterModal
        isOpen={bedroomsModalOpen}
        onClose={() => setBedroomsModalOpen(false)}
        title="Filter by Bedrooms"
        mode="multi"
        options={bedroomsOptions}
        selectedValues={bedroomsFilter}
        onApply={handleBedroomsApply}
        showApplyButton={true}
      />

      {/* Status Filter Modal */}
      <FullScreenFilterModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Filter by Status"
        icon="tag"
        mode="multi"
        options={statusOptions}
        selectedValues={statusFilter}
        onApply={handleStatusApply}
        showApplyButton={true}
      />

      {/* Price Range Modal */}
      <PriceRangeFilterModal
        isOpen={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onApply={handlePriceApply}
      />

      {/* Available By Date Modal */}
      <DateFilterModal
        isOpen={availableByModalOpen}
        onClose={() => setAvailableByModalOpen(false)}
        title="Filter by Available Date"
        label="Show units available by:"
        date={availableByDate}
        onApply={handleAvailableByApply}
      />

      {/* Sort Field Modal */}
      <FullScreenFilterModal
        isOpen={sortFieldModalOpen}
        onClose={() => setSortFieldModalOpen(false)}
        title="Sort Units By"
        icon="sort"
        mode="single"
        options={sortFieldOptions}
        selectedValues={[sortField]}
        onApply={handleSortFieldApply}
        autoCloseOnSelect={true}
      />

      {/* Sort Direction Modal */}
      <FullScreenFilterModal
        isOpen={sortDirectionModalOpen}
        onClose={() => setSortDirectionModalOpen(false)}
        title="Sort Direction"
        icon="sort"
        mode="single"
        options={sortDirectionOptions}
        selectedValues={[sortDirection]}
        onApply={handleSortDirectionApply}
        autoCloseOnSelect={true}
      />
    </div>
  )
}

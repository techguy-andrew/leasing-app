'use client'

import { useState, useEffect, useRef } from 'react'
import { useUnitsFilter } from '@/contexts/UnitsFilterContext'
import FilterDropdown, { FilterOption } from '@/components/FilterDropdown'
import PriceRangeInputDropdown from '@/components/PriceRangeInputDropdown'
import DateInputDropdown from '@/components/DateInputDropdown'

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

  // Dropdown states
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false)
  const [bedroomsDropdownOpen, setBedroomsDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [priceModalOpen, setPriceModalOpen] = useState(false)
  const [availableByModalOpen, setAvailableByModalOpen] = useState(false)
  const [sortFieldDropdownOpen, setSortFieldDropdownOpen] = useState(false)
  const [sortDirectionDropdownOpen, setSortDirectionDropdownOpen] = useState(false)

  // Refs for pill buttons
  const propertyPillRef = useRef<HTMLButtonElement>(null)
  const bedroomsPillRef = useRef<HTMLButtonElement>(null)
  const statusPillRef = useRef<HTMLButtonElement>(null)
  const pricePillRef = useRef<HTMLButtonElement>(null)
  const availableByPillRef = useRef<HTMLButtonElement>(null)
  const sortFieldPillRef = useRef<HTMLButtonElement>(null)
  const sortDirectionPillRef = useRef<HTMLButtonElement>(null)

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

  // Handle filter changes
  const handlePropertyApply = (values: string[]) => {
    setPropertyFilter(values)
    setPropertyDropdownOpen(false)
  }

  const handleBedroomsApply = (values: string[]) => {
    setBedroomsFilter(values)
    setBedroomsDropdownOpen(false)
  }

  const handleStatusApply = (values: string[]) => {
    setStatusFilter(values)
    setStatusDropdownOpen(false)
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
    setSortFieldDropdownOpen(false)
  }

  const handleSortDirectionApply = (values: string[]) => {
    const direction = values[0] as 'asc' | 'desc'
    setSortDirection(direction)
    setSortDirectionDropdownOpen(false)
  }

  // Get display labels
  const getPropertyLabel = () => {
    if (propertyFilter.includes('All') || propertyFilter.length === 0) return 'Property: All'
    if (propertyFilter.length === 1) return `Property: ${propertyFilter[0]}`
    return `Property: ${propertyFilter.length} selected`
  }

  const getBedroomsLabel = () => {
    if (bedroomsFilter.includes('All') || bedroomsFilter.length === 0) return 'Bedrooms: All'
    if (bedroomsFilter.length === 1) return `Bedrooms: ${bedroomsFilter[0]}`
    return `Bedrooms: ${bedroomsFilter.length} selected`
  }

  const getStatusLabel = () => {
    if (statusFilter.includes('All') || statusFilter.length === 0) return 'Status: All'
    if (statusFilter.length === 1) return `Status: ${statusFilter[0]}`
    return `Status: ${statusFilter.length} selected`
  }

  const getPriceLabel = () => {
    if (!minPrice && !maxPrice) return 'Price: Any'
    if (minPrice && maxPrice) return `Price: $${minPrice}-$${maxPrice}`
    if (minPrice) return `Price: $${minPrice}+`
    if (maxPrice) return `Price: <$${maxPrice}`
    return 'Price: Any'
  }

  const getAvailableByLabel = () => {
    if (!availableByDate) return 'Available: Any Date'
    const date = new Date(availableByDate)
    return `Available: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
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
      className="w-full flex items-center gap-2 flex-wrap px-6 py-3 bg-white border-b border-gray-200"
    >
      {/* Property Filter Pill */}
      <button
        ref={propertyPillRef}
        onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getPropertyLabel()}
      </button>

      {/* Bedrooms Filter Pill */}
      <button
        ref={bedroomsPillRef}
        onClick={() => setBedroomsDropdownOpen(!bedroomsDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getBedroomsLabel()}
      </button>

      {/* Status Filter Pill */}
      <button
        ref={statusPillRef}
        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getStatusLabel()}
      </button>

      {/* Price Range Pill */}
      <button
        ref={pricePillRef}
        onClick={() => setPriceModalOpen(!priceModalOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getPriceLabel()}
      </button>

      {/* Available By Pill */}
      <button
        ref={availableByPillRef}
        onClick={() => setAvailableByModalOpen(!availableByModalOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getAvailableByLabel()}
      </button>

      {/* Sort Field Pill */}
      <button
        ref={sortFieldPillRef}
        onClick={() => setSortFieldDropdownOpen(!sortFieldDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        Sort: {getSortFieldLabel()}
      </button>

      {/* Sort Direction Pill */}
      <button
        ref={sortDirectionPillRef}
        onClick={() => setSortDirectionDropdownOpen(!sortDirectionDropdownOpen)}
        className="px-3 py-1 text-[10pt] font-semibold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        {getSortDirectionLabel()}
      </button>

      {/* Dropdowns */}
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
        isOpen={bedroomsDropdownOpen}
        onClose={() => setBedroomsDropdownOpen(false)}
        triggerRef={bedroomsPillRef}
        mode="multi"
        options={bedroomsOptions}
        selectedValues={bedroomsFilter}
        onApply={handleBedroomsApply}
        showApplyButton={true}
      />

      <FilterDropdown
        isOpen={statusDropdownOpen}
        onClose={() => setStatusDropdownOpen(false)}
        triggerRef={statusPillRef}
        mode="multi"
        options={statusOptions}
        selectedValues={statusFilter}
        onApply={handleStatusApply}
        showApplyButton={true}
      />

      <FilterDropdown
        isOpen={sortFieldDropdownOpen}
        onClose={() => setSortFieldDropdownOpen(false)}
        triggerRef={sortFieldPillRef}
        mode="single"
        options={sortFieldOptions}
        selectedValues={[sortField]}
        onApply={handleSortFieldApply}
        autoCloseOnSelect={true}
      />

      <FilterDropdown
        isOpen={sortDirectionDropdownOpen}
        onClose={() => setSortDirectionDropdownOpen(false)}
        triggerRef={sortDirectionPillRef}
        mode="single"
        options={sortDirectionOptions}
        selectedValues={[sortDirection]}
        onApply={handleSortDirectionApply}
        autoCloseOnSelect={true}
      />

      {/* Price Range Dropdown */}
      <PriceRangeInputDropdown
        isOpen={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        triggerRef={pricePillRef}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onApply={handlePriceApply}
        showApplyButton={true}
      />

      {/* Available By Date Dropdown */}
      <DateInputDropdown
        isOpen={availableByModalOpen}
        onClose={() => setAvailableByModalOpen(false)}
        triggerRef={availableByPillRef}
        label="Show units available by:"
        date={availableByDate}
        onApply={handleAvailableByApply}
        showApplyButton={true}
      />
    </div>
  )
}

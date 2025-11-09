'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type SortField = 'unitNumber' | 'bedrooms' | 'price' | 'property' | 'availableOn'

interface UnitsFilterContextType {
  propertyFilter: string[]
  setPropertyFilter: (property: string[]) => void
  bedroomsFilter: string[]
  setBedroomsFilter: (bedrooms: string[]) => void
  statusFilter: string[]
  setStatusFilter: (status: string[]) => void
  minPrice: string
  setMinPrice: (price: string) => void
  maxPrice: string
  setMaxPrice: (price: string) => void
  availableByDate: string
  setAvailableByDate: (date: string) => void
  sortField: SortField
  setSortField: (field: SortField) => void
  sortDirection: 'asc' | 'desc'
  setSortDirection: (direction: 'asc' | 'desc') => void
}

const UnitsFilterContext = createContext<UnitsFilterContextType | undefined>(undefined)

export function UnitsFilterProvider({ children }: { children: ReactNode }) {
  const [propertyFilter, setPropertyFilter] = useState<string[]>(['All'])
  const [bedroomsFilter, setBedroomsFilter] = useState<string[]>(['All'])
  const [statusFilter, setStatusFilter] = useState<string[]>(['All'])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [availableByDate, setAvailableByDate] = useState('')
  const [sortField, setSortField] = useState<SortField>('property')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  return (
    <UnitsFilterContext.Provider
      value={{
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
        setSortDirection,
      }}
    >
      {children}
    </UnitsFilterContext.Provider>
  )
}

export function useUnitsFilter() {
  const context = useContext(UnitsFilterContext)
  if (context === undefined) {
    throw new Error('useUnitsFilter must be used within a UnitsFilterProvider')
  }
  return context
}

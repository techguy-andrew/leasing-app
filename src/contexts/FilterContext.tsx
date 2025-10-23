'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterContextType {
  statusFilter: string[]
  setStatusFilter: (status: string[]) => void
  dateType: 'moveIn' | 'application'
  setDateType: (type: 'moveIn' | 'application') => void
  calendarFilter: string
  setCalendarFilter: (filter: string) => void
  propertyFilter: string
  setPropertyFilter: (property: string) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [statusFilter, setStatusFilter] = useState<string[]>(['All'])
  const [dateType, setDateType] = useState<'moveIn' | 'application'>('moveIn')
  const [calendarFilter, setCalendarFilter] = useState('All Time')
  const [propertyFilter, setPropertyFilter] = useState('All')

  return (
    <FilterContext.Provider
      value={{
        statusFilter,
        setStatusFilter,
        dateType,
        setDateType,
        calendarFilter,
        setCalendarFilter,
        propertyFilter,
        setPropertyFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider')
  }
  return context
}

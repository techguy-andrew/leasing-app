'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterContextType {
  statusFilter: string
  setStatusFilter: (status: string) => void
  sortDirection: 'soonest' | 'furthest'
  setSortDirection: (direction: 'soonest' | 'furthest') => void
  applicationDateSort: 'soonest' | 'furthest'
  setApplicationDateSort: (direction: 'soonest' | 'furthest') => void
  calendarFilter: string
  setCalendarFilter: (filter: string) => void
  propertyFilter: string
  setPropertyFilter: (property: string) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortDirection, setSortDirection] = useState<'soonest' | 'furthest'>('soonest')
  const [applicationDateSort, setApplicationDateSort] = useState<'soonest' | 'furthest'>('soonest')
  const [calendarFilter, setCalendarFilter] = useState('All Time')
  const [propertyFilter, setPropertyFilter] = useState('All')

  return (
    <FilterContext.Provider
      value={{
        statusFilter,
        setStatusFilter,
        sortDirection,
        setSortDirection,
        applicationDateSort,
        setApplicationDateSort,
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

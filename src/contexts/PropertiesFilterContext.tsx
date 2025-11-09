'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface PropertiesFilterContextType {
  // City filter
  cityFilter: string[]
  setCityFilter: (cities: string[]) => void

  // State filter
  stateFilter: string[]
  setStateFilter: (states: string[]) => void

  // Sort options
  sortField: 'name' | 'city' | 'createdAt'
  setSortField: (field: 'name' | 'city' | 'createdAt') => void
  sortDirection: 'asc' | 'desc'
  setSortDirection: (direction: 'asc' | 'desc') => void

  // Reset all filters
  resetFilters: () => void
}

const PropertiesFilterContext = createContext<PropertiesFilterContextType | undefined>(undefined)

export function PropertiesFilterProvider({ children }: { children: ReactNode }) {
  const [cityFilter, setCityFilter] = useState<string[]>([])
  const [stateFilter, setStateFilter] = useState<string[]>([])
  const [sortField, setSortField] = useState<'name' | 'city' | 'createdAt'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const resetFilters = () => {
    setCityFilter([])
    setStateFilter([])
    setSortField('name')
    setSortDirection('asc')
  }

  return (
    <PropertiesFilterContext.Provider
      value={{
        cityFilter,
        setCityFilter,
        stateFilter,
        setStateFilter,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        resetFilters
      }}
    >
      {children}
    </PropertiesFilterContext.Provider>
  )
}

export function usePropertiesFilter() {
  const context = useContext(PropertiesFilterContext)
  if (context === undefined) {
    throw new Error('usePropertiesFilter must be used within a PropertiesFilterProvider')
  }
  return context
}

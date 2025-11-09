'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface PeopleFilterContextType {
  // Status filter
  statusFilter: string[]
  setStatusFilter: (statuses: string[]) => void

  // Sort options
  sortField: 'name' | 'status' | 'createdAt'
  setSortField: (field: 'name' | 'status' | 'createdAt') => void
  sortDirection: 'asc' | 'desc'
  setSortDirection: (direction: 'asc' | 'desc') => void

  // Reset all filters
  resetFilters: () => void
}

const PeopleFilterContext = createContext<PeopleFilterContextType | undefined>(undefined)

export function PeopleFilterProvider({ children }: { children: ReactNode }) {
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [sortField, setSortField] = useState<'name' | 'status' | 'createdAt'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const resetFilters = () => {
    setStatusFilter([])
    setSortField('name')
    setSortDirection('asc')
  }

  return (
    <PeopleFilterContext.Provider
      value={{
        statusFilter,
        setStatusFilter,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        resetFilters
      }}
    >
      {children}
    </PeopleFilterContext.Provider>
  )
}

export function usePeopleFilter() {
  const context = useContext(PeopleFilterContext)
  if (context === undefined) {
    throw new Error('usePeopleFilter must be used within a PeopleFilterProvider')
  }
  return context
}

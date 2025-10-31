'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { SignIn } from '@clerk/nextjs'
import TopBar from './TopBar'
import SideBar from './SideBar'
import SearchBox from '@/components/features/applications/SearchBox'
import FilterBar from '@/components/features/applications/FilterBar'
import ToolBar from '@/components/features/applications/ToolBar'
import { FilterProvider, useFilter } from '@/contexts/FilterContext'
import { ToolBarProvider, useToolBar } from '@/contexts/ToolBarContext'

interface NavigationLayoutProps {
  children: React.ReactNode
}

// Authenticated layout with all the navigation components
function AuthenticatedLayout({ children }: NavigationLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isApplicationsPage = pathname === '/applications'
  const isAppDetailPage = pathname.startsWith('/applications/') && pathname !== '/applications'

  const {
    statusFilter,
    setStatusFilter,
    dateType,
    setDateType,
    calendarFilter,
    setCalendarFilter,
    propertyFilter,
    setPropertyFilter,
    sortDirection,
    setSortDirection,
  } = useFilter()

  const { onSendStatusMessage, onUpdateStatus } = useToolBar()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header Container - Auto-sized, never shrinks */}
      <header className="flex-shrink-0">
        {/* Top Bar - Always visible */}
        <TopBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

        {/* Search Box - Only on applications list page */}
        {isApplicationsPage && <SearchBox />}

        {/* Filter Bar - Only on applications list page */}
        {isApplicationsPage && (
          <FilterBar
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            dateType={dateType}
            onDateTypeChange={setDateType}
            calendarFilter={calendarFilter}
            onCalendarChange={setCalendarFilter}
            propertyFilter={propertyFilter}
            onPropertyChange={setPropertyFilter}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
          />
        )}

        {/* Tool Bar - Only on application detail pages */}
        {isAppDetailPage && onSendStatusMessage && onUpdateStatus && (
          <ToolBar
            onSendStatusMessage={onSendStatusMessage}
            onUpdateStatus={onUpdateStatus}
          />
        )}
      </header>

      {/* Toggleable Sidebar - Overlay, doesn't affect layout */}
      <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area - Fills remaining space, scrollable */}
      <main className="flex-1 flex flex-col items-center justify-start overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

// Layout content that checks authentication state
function LayoutContent({ children }: NavigationLayoutProps) {
  const { isSignedIn, isLoaded } = useUser()

  // If Clerk hasn't loaded yet, show nothing (or a loading state)
  if (!isLoaded) {
    return null
  }

  // If user is not signed in, show only the minimal sign-in page
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </div>
    )
  }

  // User is authenticated, render the full layout with context providers
  return (
    <FilterProvider>
      <ToolBarProvider>
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      </ToolBarProvider>
    </FilterProvider>
  )
}

export default function NavigationLayout({ children }: NavigationLayoutProps) {
  return <LayoutContent>{children}</LayoutContent>
}

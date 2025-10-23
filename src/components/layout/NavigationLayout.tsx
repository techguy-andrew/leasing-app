'use client'

import { useState, useEffect } from 'react'
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
    sortDirection,
    setSortDirection,
    applicationDateSort,
    setApplicationDateSort,
    calendarFilter,
    setCalendarFilter,
    propertyFilter,
    setPropertyFilter,
  } = useFilter()

  const { onSendStatusMessage } = useToolBar()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  // Calculate and set CSS custom properties for dynamic header heights
  useEffect(() => {
    const updateHeights = () => {
      const topbar = document.querySelector('[data-topbar]') as HTMLElement
      const searchbox = document.querySelector('[data-searchbox]') as HTMLElement
      const filterbar = document.querySelector('[data-filterbar]') as HTMLElement
      const toolbar = document.querySelector('[data-toolbar]') as HTMLElement

      const topbarHeight = topbar?.offsetHeight || 0
      const searchboxHeight = searchbox?.offsetHeight || 0
      const filterbarHeight = filterbar?.offsetHeight || 0
      const toolbarHeight = toolbar?.offsetHeight || 0

      document.documentElement.style.setProperty('--topbar-height', `${topbarHeight}px`)
      document.documentElement.style.setProperty('--searchbox-height', `${searchboxHeight}px`)

      let totalHeight = topbarHeight
      if (isApplicationsPage) {
        totalHeight += searchboxHeight + filterbarHeight
      } else if (isAppDetailPage) {
        totalHeight += toolbarHeight
      }

      document.documentElement.style.setProperty('--header-stack-height', `${totalHeight}px`)
    }

    // Update on mount and when route changes
    updateHeights()

    // Use ResizeObserver to track content-driven size changes
    const resizeObserver = new ResizeObserver(updateHeights)

    const topbar = document.querySelector('[data-topbar]')
    const searchbox = document.querySelector('[data-searchbox]')
    const filterbar = document.querySelector('[data-filterbar]')
    const toolbar = document.querySelector('[data-toolbar]')

    if (topbar) resizeObserver.observe(topbar)
    if (searchbox) resizeObserver.observe(searchbox)
    if (filterbar) resizeObserver.observe(filterbar)
    if (toolbar) resizeObserver.observe(toolbar)

    // Update on window resize as fallback
    window.addEventListener('resize', updateHeights)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeights)
    }
  }, [isApplicationsPage, isAppDetailPage])

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar - Fixed at top */}
      <TopBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Search Box - Fixed below TopBar, only on applications page */}
      {isApplicationsPage && <SearchBox />}

      {/* Filter Bar - Fixed below SearchBox, only on applications page */}
      {isApplicationsPage && (
        <FilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortDirection={sortDirection}
          onSortChange={setSortDirection}
          applicationDateSort={applicationDateSort}
          onApplicationDateSortChange={setApplicationDateSort}
          calendarFilter={calendarFilter}
          onCalendarChange={setCalendarFilter}
          propertyFilter={propertyFilter}
          onPropertyChange={setPropertyFilter}
        />
      )}

      {/* Tool Bar - Fixed below TopBar, only on application detail pages */}
      {isAppDetailPage && onSendStatusMessage && (
        <ToolBar
          onSendStatusMessage={onSendStatusMessage}
        />
      )}

      {/* Toggleable Sidebar */}
      <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area - Horizontally centered, top-aligned with overflow handling */}
      <main
        className="flex-1 flex flex-col items-center justify-start overflow-y-auto"
        style={{ paddingTop: 'var(--header-stack-height, 0px)' }}
      >
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

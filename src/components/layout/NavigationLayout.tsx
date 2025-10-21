'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import TopBar from './TopBar'
import SideBar from './SideBar'
import NavBar from '@/components/shared/navigation/NavBar'
import FilterBar from '@/components/features/applications/FilterBar'
import ToolBar from '@/components/features/applications/ToolBar'
import { FilterProvider, useFilter } from '@/contexts/FilterContext'
import { ToolBarProvider, useToolBar } from '@/contexts/ToolBarContext'

interface NavigationLayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: NavigationLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isApplicationsPage = pathname === '/applications'
  const isAppDetailPage = pathname.startsWith('/applications/') && pathname !== '/applications'

  const {
    statusFilter,
    setStatusFilter,
    sortDirection,
    setSortDirection,
    calendarFilter,
    setCalendarFilter,
  } = useFilter()

  const { onSendStatusMessage } = useToolBar()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  // Calculate and set CSS custom properties for dynamic header heights
  useEffect(() => {
    const updateHeights = () => {
      const topbar = document.querySelector('[data-topbar]') as HTMLElement
      const navbar = document.querySelector('[data-navbar]') as HTMLElement
      const filterbar = document.querySelector('[data-filterbar]') as HTMLElement
      const toolbar = document.querySelector('[data-toolbar]') as HTMLElement

      const topbarHeight = topbar?.offsetHeight || 0
      const navbarHeight = navbar?.offsetHeight || 0
      const filterbarHeight = filterbar?.offsetHeight || 0
      const toolbarHeight = toolbar?.offsetHeight || 0

      document.documentElement.style.setProperty('--topbar-height', `${topbarHeight}px`)
      document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`)

      let totalHeight = topbarHeight + navbarHeight
      if (isApplicationsPage) {
        totalHeight += filterbarHeight
      } else if (isAppDetailPage) {
        totalHeight += toolbarHeight
      }

      document.documentElement.style.setProperty('--header-stack-height', `${totalHeight}px`)
    }

    // Update on mount and when route changes
    updateHeights()

    // Update on window resize
    window.addEventListener('resize', updateHeights)
    return () => window.removeEventListener('resize', updateHeights)
  }, [isApplicationsPage, isAppDetailPage])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar - Fixed at top */}
      <TopBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Navigation Bar - Fixed below TopBar */}
      <NavBar />

      {/* Filter Bar - Fixed below NavBar, only on applications page */}
      {isApplicationsPage && (
        <FilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortDirection={sortDirection}
          onSortChange={setSortDirection}
          calendarFilter={calendarFilter}
          onCalendarChange={setCalendarFilter}
        />
      )}

      {/* Tool Bar - Fixed below NavBar, only on application detail pages */}
      {isAppDetailPage && onSendStatusMessage && (
        <ToolBar
          onSendStatusMessage={onSendStatusMessage}
        />
      )}

      {/* Toggleable Sidebar */}
      <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area - Dynamic padding based on header stack height */}
      <main
        className="flex-1 flex flex-col"
        style={{ paddingTop: 'var(--header-stack-height, 0px)' }}
      >
        {children}
      </main>
    </div>
  )
}

export default function NavigationLayout({ children }: NavigationLayoutProps) {
  return (
    <FilterProvider>
      <ToolBarProvider>
        <LayoutContent>{children}</LayoutContent>
      </ToolBarProvider>
    </FilterProvider>
  )
}

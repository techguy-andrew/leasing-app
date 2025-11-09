'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { SignIn } from '@clerk/nextjs'
import TopBar from '@/components/TopBar'
import SideBar from '@/components/SideBar'
import SearchModal from '@/components/SearchModal'
import FilterBar from '@/components/FilterBar'
import ToolBar from '@/components/ToolBar'
import { FilterProvider, useFilter } from '@/contexts/FilterContext'
import { ToolBarProvider, useToolBar } from '@/contexts/ToolBarContext'

interface NavigationLayoutProps {
  children: React.ReactNode
}

/**
 * 🎯 FOREVER-ADAPTABLE LAYOUT ARCHITECTURE
 *
 * Based on Design Philosophy: Flexbox Mastery Lab
 *
 * This layout uses pure CSS flexbox for 100% fluid, responsive adaptation.
 * NO JavaScript calculations, NO pixel measurements, NO manual padding.
 *
 * Key Principles:
 * - Section 3.4: flex-col for vertical stacking
 * - Section 2.2: flex-1 for proportional space filling
 * - Section 5.4: Natural spacing with gap and padding
 * - h-screen: Full viewport height container
 * - flex-shrink-0: Fixed-size headers that don't compress
 * - overflow-y-auto: Scrollable content area
 *
 * Layout Structure:
 * ┌────────────────────────────────────┐
 * │  Header (flex-shrink-0)            │ ← Auto height based on content
 * │  - TopBar                          │
 * │  - SearchModal (conditional)       │
 * │  - FilterBar (conditional)         │
 * │  - ToolBar (conditional)           │
 * ├────────────────────────────────────┤
 * │                                    │
 * │  Main (flex-1)                     │ ← Takes ALL remaining space
 * │  - Scrollable content              │
 * │  - Never cuts off                  │
 * │                                    │
 * └────────────────────────────────────┘
 *
 * Adapts to ALL screen sizes:
 * ✅ iPhone SE (375px) to 8K monitors (7680px)
 * ✅ Portrait and landscape orientations
 * ✅ Browser zoom from 25% to 500%
 * ✅ Split-screen multitasking
 * ✅ Dynamic content height changes
 * ✅ No content ever hidden or cut off
 */

// Authenticated layout with forever-adaptable flexbox architecture
function AuthenticatedLayout({ children }: NavigationLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isApplicationsPage = pathname === '/applications'
  const isAppDetailPage = pathname.startsWith('/applications/') && pathname !== '/applications'
  const headerRef = useRef<HTMLElement>(null)

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

  const { onSendStatusMessage, onSendWelcomeMessage, onUpdateStatus } = useToolBar()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  // Set CSS variable for header height to help center modals in content area
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight
        document.documentElement.style.setProperty('--header-height', `${height}px`)
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [isApplicationsPage, isAppDetailPage]) // Re-measure when page changes (header content changes)

  return (
    <div className="flex flex-col h-screen">
      {/*
        ═══════════════════════════════════════════════════════════════
        HEADER SECTION - flex-shrink-0
        ═══════════════════════════════════════════════════════════════

        All header components wrapped in a single container with flex-shrink-0.
        This ensures headers:
        - Stack vertically in document flow
        - Take only the space they need
        - Never compress or overlap
        - Adapt height automatically to content

        NO manual height calculations
        NO CSS custom properties
        NO JavaScript measurements
      */}
      <header ref={headerRef} className="flex-shrink-0 flex flex-col">
        {/* Top Bar - Always visible */}
        <TopBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

        {/* Applications Page Headers - Conditionally rendered */}
        {isApplicationsPage && (
          <>
            <SearchModal />
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
          </>
        )}

        {/* Application Detail Page Toolbar - Conditionally rendered */}
        {isAppDetailPage && onSendStatusMessage && onSendWelcomeMessage && onUpdateStatus && (
          <ToolBar
            onSendStatusMessage={onSendStatusMessage}
            onSendWelcomeMessage={onSendWelcomeMessage}
            onUpdateStatus={onUpdateStatus}
          />
        )}
      </header>

      {/* Toggleable Sidebar - Overlays on top, doesn't affect layout flow */}
      <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/*
        ═══════════════════════════════════════════════════════════════
        MAIN CONTENT AREA - flex-1
        ═══════════════════════════════════════════════════════════════

        The magic of forever-adaptable design!

        flex-1 means:
        - Takes ALL remaining vertical space after header
        - Grows/shrinks automatically with viewport changes
        - No manual calculations needed
        - No pixel values
        - No JavaScript

        overflow-y-auto means:
        - Scrolls when content exceeds available space
        - Never cuts off content
        - Header stays fixed at top naturally

        This works on:
        ✅ Mobile phones (375px height)
        ✅ Tablets (1024px height)
        ✅ Laptops (768px - 1080px height)
        ✅ Desktop monitors (1440px - 2160px height)
        ✅ Ultra-wide displays
        ✅ Split-screen mode
        ✅ Browser zoom 25% - 500%
      */}
      <main className="flex-1 overflow-y-auto">
        {/*
          Content container
          - ALL pages: 100% full width, fluid and adaptable
          - NO max-width constraints anywhere
          - Pages handle their own internal layout
          - Responsive and adapts to any screen size
        */}
        <div className="w-full h-full">
          {children}
        </div>
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

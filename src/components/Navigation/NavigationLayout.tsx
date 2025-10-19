'use client'

import { useState } from 'react'
import TopBar from './TopBar'
import SideBar from './SideBar'

interface NavigationLayoutProps {
  children: React.ReactNode
}

export default function NavigationLayout({ children }: NavigationLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Top Bar - always at the top */}
      <div className="sticky top-0 z-[100]">
        <TopBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      </div>

      {/* Toggleable Sidebar */}
      <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area - stacked directly below TopBar */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}

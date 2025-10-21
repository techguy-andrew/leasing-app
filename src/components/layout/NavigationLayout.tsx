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
      {/* Top Bar */}
      <TopBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Toggleable Sidebar */}
      <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area - stacked directly below TopBar and Breadcrumb */}
      <main className="flex-1 flex flex-col pt-[121px]">
        {children}
      </main>
    </div>
  )
}

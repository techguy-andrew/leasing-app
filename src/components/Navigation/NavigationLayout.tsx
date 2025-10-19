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
    <div className="min-h-screen">
      {/* Fixed Top Bar */}
      <TopBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Toggleable Sidebar */}
      <SideBar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <main className="pt-[65px] min-h-screen">
        <div className="relative">
          {children}
        </div>
      </main>
    </div>
  )
}

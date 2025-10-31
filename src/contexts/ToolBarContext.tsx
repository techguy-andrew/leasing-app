'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ToolBarContextType {
  onSendStatusMessage: (() => void) | null
  setOnSendStatusMessage: (callback: (() => void) | null) => void
  onUpdateStatus: (() => void) | null
  setOnUpdateStatus: (callback: (() => void) | null) => void
}

const ToolBarContext = createContext<ToolBarContextType | undefined>(undefined)

export function ToolBarProvider({ children }: { children: ReactNode }) {
  const [onSendStatusMessage, setOnSendStatusMessage] = useState<(() => void) | null>(null)
  const [onUpdateStatus, setOnUpdateStatus] = useState<(() => void) | null>(null)

  return (
    <ToolBarContext.Provider
      value={{
        onSendStatusMessage,
        setOnSendStatusMessage,
        onUpdateStatus,
        setOnUpdateStatus,
      }}
    >
      {children}
    </ToolBarContext.Provider>
  )
}

export function useToolBar() {
  const context = useContext(ToolBarContext)
  if (context === undefined) {
    throw new Error('useToolBar must be used within a ToolBarProvider')
  }
  return context
}

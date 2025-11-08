'use client'

import { useState, useRef } from 'react'
import IconPack from '@/components/IconPack'
import OptionsModal, { ModalAction } from '@/components/OptionsModal'

interface StatusMenuButtonProps {
  onEdit: () => void
  onDelete: () => void
}

export default function StatusMenuButton({ onEdit, onDelete }: StatusMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const actions: ModalAction[] = [
    {
      label: 'Edit Status',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: onEdit
    },
    {
      label: 'Delete Status',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: onDelete,
      destructive: true
    }
  ]

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center"
        aria-label="Status options"
        type="button"
      >
        <IconPack.Menu size="small" />
      </button>

      <OptionsModal
        isOpen={isOpen}
        triggerRef={buttonRef}
        actions={actions}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { Reorder } from 'motion/react'
import StatusMenuButton from './StatusMenuButton'
import ColorPicker from '@/components/shared/ColorPicker'
import InlineTextField from '@/components/shared/fields/InlineTextField'
import SaveButton from '@/components/shared/buttons/SaveButton'
import CancelButton from '@/components/shared/buttons/CancelButton'
import Toast, { ToastType } from '@/components/shared/feedback/Toast'
import ConfirmModal from '@/components/shared/modals/ConfirmModal'
import IconPack from '@/components/shared/icons/IconPack'

export interface Status {
  id: string
  name: string
  color: string
  order: number
  userId: string | null
  createdAt: string
  updatedAt: string
  clientId?: string // Stable ID for React keys to prevent remounting
}

interface StatusListProps {
  initialStatuses?: Status[]
  onStatusesChange?: (statuses: Status[]) => void
}

export default function StatusList({ initialStatuses = [], onStatusesChange }: StatusListProps) {
  const [statuses, setStatuses] = useState<Status[]>(() =>
    initialStatuses.map(status => ({
      ...status,
      clientId: status.clientId || status.id
    }))
  )
  const [isLoading] = useState(false)
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingStatusId, setDeletingStatusId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<ToastType>('success')

  const inputRef = useRef<HTMLDivElement>(null)
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastReorderRef = useRef<Status[] | null>(null)
  const originalStatusRef = useRef<Status | null>(null)

  useEffect(() => {
    setStatuses(
      initialStatuses.map(status => ({
        ...status,
        clientId: status.clientId || status.id
      }))
    )
  }, [initialStatuses])

  useEffect(() => {
    if (editingStatusId?.startsWith('temp-')) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [editingStatusId])

  useEffect(() => {
    return () => {
      if (reorderTimeoutRef.current) {
        clearTimeout(reorderTimeoutRef.current)
      }
    }
  }, [])

  const handleAddStatus = () => {
    const tempId = `temp-${Date.now()}`
    const newStatus: Status = {
      id: tempId,
      clientId: tempId,
      name: '',
      color: '#6B7280', // Default grey
      order: 0,
      userId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setStatuses(prev => [newStatus, ...prev])
    setEditingStatusId(tempId)
  }

  const handleEditStatus = (status: Status) => {
    originalStatusRef.current = { ...status }
    setEditingStatusId(status.clientId || status.id)
  }

  const handleStatusNameChange = (statusId: string, name: string) => {
    setStatuses(prev => {
      const updatedStatuses = prev.map(status =>
        (status.clientId || status.id) === statusId
          ? { ...status, name }
          : status
      )
      onStatusesChange?.(updatedStatuses)
      return updatedStatuses
    })
  }

  const handleColorChange = (statusId: string, color: string) => {
    setStatuses(prev => {
      const updatedStatuses = prev.map(status =>
        (status.clientId || status.id) === statusId
          ? { ...status, color }
          : status
      )
      onStatusesChange?.(updatedStatuses)
      return updatedStatuses
    })
  }

  const handleCancelEdit = () => {
    if (editingStatusId?.startsWith('temp-')) {
      setStatuses(prev => prev.filter(status => status.id !== editingStatusId))
    } else if (originalStatusRef.current) {
      setStatuses(prev => {
        const restoredStatuses = prev.map(status =>
          (status.clientId || status.id) === editingStatusId
            ? originalStatusRef.current!
            : status
        )
        onStatusesChange?.(restoredStatuses)
        return restoredStatuses
      })
    }

    setEditingStatusId(null)
    originalStatusRef.current = null
  }

  const handleSaveEdit = async () => {
    if (!editingStatusId) return

    const statusToSave = statuses.find(s => (s.clientId || s.id) === editingStatusId)
    if (!statusToSave) return

    if (!statusToSave.name.trim()) {
      setToastType('error')
      setToastMessage('Status name is required')
      return
    }

    setIsSaving(true)
    setToastMessage(null)

    const isNewStatus = editingStatusId.startsWith('temp-')

    try {
      if (isNewStatus) {
        const response = await fetch('/api/statuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: statusToSave.name.trim(),
            color: statusToSave.color
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create status')
        }

        setStatuses(prev => {
          const updatedStatuses = prev.map(status =>
            status.id === editingStatusId
              ? { ...data.data, clientId: data.data.id }
              : status
          )
          onStatusesChange?.(updatedStatuses)
          return updatedStatuses
        })
        setToastType('success')
        setToastMessage('Status added successfully!')
      } else {
        const response = await fetch(`/api/statuses/${editingStatusId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: statusToSave.name.trim(),
            color: statusToSave.color
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update status')
        }

        setStatuses(prev => {
          const updatedStatuses = prev.map(status =>
            status.id === editingStatusId ? data.data : status
          )
          onStatusesChange?.(updatedStatuses)
          return updatedStatuses
        })
        setToastType('success')
        setToastMessage('Status updated successfully!')
      }

      setEditingStatusId(null)
      originalStatusRef.current = null
    } catch (error) {
      setToastType('error')
      setToastMessage(
        error instanceof Error
          ? error.message
          : isNewStatus
          ? 'Failed to create status'
          : 'Failed to update status'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteStatus = (statusId: string) => {
    setDeletingStatusId(statusId)
    setDeleteErrorMessage(null)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingStatusId) return

    try {
      const response = await fetch(`/api/statuses/${deletingStatusId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if it's a conflict error (status in use)
        if (response.status === 409) {
          setDeleteErrorMessage(data.message || 'This status is currently in use')
          return
        }
        throw new Error(data.error || 'Failed to delete status')
      }

      setStatuses(prev => {
        const updatedStatuses = prev.filter(status => status.id !== deletingStatusId)
        onStatusesChange?.(updatedStatuses)
        return updatedStatuses
      })
      setToastType('success')
      setToastMessage('Status deleted successfully!')
      setShowDeleteModal(false)
      setDeletingStatusId(null)
    } catch (error) {
      setToastType('error')
      setToastMessage(error instanceof Error ? error.message : 'Failed to delete status')
      setShowDeleteModal(false)
      setDeletingStatusId(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setDeletingStatusId(null)
    setDeleteErrorMessage(null)
  }

  const persistStatusOrder = async (newOrder: Status[], previousStatuses: Status[]) => {
    try {
      const statusIds = newOrder
        .filter(status => !status.id.startsWith('temp-'))
        .map(status => status.id)

      if (statusIds.length === 0) {
        return
      }

      const response = await fetch('/api/statuses/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusIds })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reorder statuses')
      }

      setStatuses(prev => {
        const tempStatuses = prev.filter(s => s.id.startsWith('temp-'))
        const serverStatuses = data.data.map((s: Status) => ({ ...s, clientId: s.id }))
        const updatedStatuses = [...tempStatuses, ...serverStatuses]
        onStatusesChange?.(updatedStatuses)
        return updatedStatuses
      })

      setToastType('success')
      setToastMessage('Statuses reordered successfully!')
    } catch (error) {
      setStatuses(previousStatuses)
      onStatusesChange?.(previousStatuses)
      setToastType('error')
      setToastMessage(error instanceof Error ? error.message : 'Failed to reorder statuses')
    }
  }

  const handleReorder = (newOrder: Status[]) => {
    const previousStatuses = lastReorderRef.current || statuses
    setStatuses(newOrder)
    onStatusesChange?.(newOrder)
    lastReorderRef.current = previousStatuses

    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current)
    }

    reorderTimeoutRef.current = setTimeout(() => {
      persistStatusOrder(newOrder, previousStatuses)
      lastReorderRef.current = null
    }, 300)
  }

  if (isLoading) {
    return (
      <>
        <div className="flex items-center gap-[2%]">
          <span className="text-sm sm:text-base font-semibold text-gray-500">Statuses</span>
        </div>
        <div className="text-sm sm:text-base text-gray-600">Loading statuses...</div>
      </>
    )
  }

  return (
    <>
      {/* Header with Add Status Icon */}
      <div className="flex items-center gap-[2%]">
        <span className="text-sm sm:text-base font-semibold text-gray-500">Statuses</span>
        <IconPack.Add onClick={handleAddStatus} size="small" disabled={isSaving} />
      </div>

      {/* Statuses List */}
      <Reorder.Group
        axis="y"
        values={statuses}
        onReorder={handleReorder}
        className={`flex flex-col gap-[2%] ${isSaving ? 'cursor-wait' : ''}`}
      >
        {statuses.map((status) => (
          <Reorder.Item
            key={status.clientId || status.id}
            value={status}
            id={status.clientId || status.id}
            className={`flex items-start gap-3 ${
              isSaving && editingStatusId === (status.clientId || status.id)
                ? 'cursor-wait'
                : editingStatusId !== (status.clientId || status.id)
                ? 'cursor-grab active:cursor-grabbing'
                : ''
            }`}
            drag={editingStatusId !== (status.clientId || status.id) && !isSaving}
            whileDrag={{
              scale: 1.02,
              opacity: 0.8,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              zIndex: 10
            }}
            transition={{
              layout: {
                type: 'spring',
                stiffness: 350,
                damping: 25
              },
              default: { duration: 0.2 }
            }}
            layout
          >
            {/* Color Picker */}
            <div className="flex-shrink-0 mt-[2px]">
              <ColorPicker
                selectedColor={status.color}
                onChange={(color) => handleColorChange(status.clientId || status.id, color)}
                disabled={editingStatusId !== (status.clientId || status.id)}
              />
            </div>

            {/* Status Name */}
            <div
              className={`flex-1 flex flex-col gap-[2%] ${
                isSaving && editingStatusId === (status.clientId || status.id)
                  ? 'cursor-wait'
                  : editingStatusId !== (status.clientId || status.id)
                  ? 'cursor-grab active:cursor-grabbing'
                  : ''
              }`}
            >
              <div className={`text-gray-900 ${
                isSaving && editingStatusId === (status.clientId || status.id)
                  ? 'cursor-wait'
                  : editingStatusId !== (status.clientId || status.id)
                  ? 'cursor-grab active:cursor-grabbing'
                  : ''
              }`}>
                <InlineTextField
                  ref={editingStatusId === (status.clientId || status.id) ? inputRef : null}
                  value={status.name}
                  onChange={(value) => handleStatusNameChange(status.clientId || status.id, value)}
                  isEditMode={editingStatusId === (status.clientId || status.id)}
                  placeholder="Status name"
                  onEnterPress={handleSaveEdit}
                  className={
                    isSaving && editingStatusId === (status.clientId || status.id)
                      ? 'cursor-wait pointer-events-none'
                      : editingStatusId !== (status.clientId || status.id)
                      ? 'cursor-grab active:cursor-grabbing'
                      : ''
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            {editingStatusId === (status.clientId || status.id) ? (
              <div className="flex items-center gap-2">
                <CancelButton onClick={handleCancelEdit} size="small" />
                <SaveButton onClick={handleSaveEdit} disabled={isSaving} size="small" />
              </div>
            ) : (
              <div>
                <StatusMenuButton
                  onEdit={() => handleEditStatus(status)}
                  onDelete={() => handleDeleteStatus(status.id)}
                />
              </div>
            )}
          </Reorder.Item>
        ))}

        {/* Empty State */}
        {statuses.length === 0 && (
          <div className="text-sm sm:text-base text-gray-400">
            No statuses yet. Click the + icon to add your first status.
          </div>
        )}
      </Reorder.Group>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Status"
        message={
          deleteErrorMessage ||
          'Are you sure you want to delete this status? This action cannot be undone.'
        }
        confirmText={deleteErrorMessage ? 'Close' : 'Delete'}
        cancelText={deleteErrorMessage ? undefined : 'Cancel'}
        onConfirm={deleteErrorMessage ? handleDeleteCancel : handleDeleteConfirm}
        onCancel={deleteErrorMessage ? undefined : handleDeleteCancel}
        isDestructive={!deleteErrorMessage}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </>
  )
}

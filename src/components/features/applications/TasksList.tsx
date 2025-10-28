'use client'

import { useState, useEffect, useRef } from 'react'
import { Reorder } from 'motion/react'
import TaskMenuButton from './TaskMenuButton'
import InlineTextField from '@/components/shared/fields/InlineTextField'
import SaveButton from '@/components/shared/buttons/SaveButton'
import CancelButton from '@/components/shared/buttons/CancelButton'
import Toast, { ToastType } from '@/components/shared/feedback/Toast'
import ConfirmModal from '@/components/shared/modals/ConfirmModal'
import IconPack from '@/components/shared/icons/IconPack'

interface Task {
  id: string
  description: string
  completed: boolean
  type: 'AGENT' | 'APPLICANT' | 'NOTES'
  order: number
  createdAt: string
  updatedAt: string
  clientId?: string // Stable ID for React keys to prevent remounting
}

interface TasksListProps {
  applicationId: number
  initialTasks?: Task[]
  onTasksChange?: (tasks: Task[]) => void
  taskType: 'AGENT' | 'APPLICANT' | 'NOTES'
  title: string
}

// Helper function to get section-specific labels
function getSectionLabels(taskType: 'AGENT' | 'APPLICANT' | 'NOTES') {
  switch (taskType) {
    case 'AGENT':
      return { singular: 'Leasing Agent Task', plural: 'Leasing Agent Tasks', lowercase: 'leasing agent task' }
    case 'APPLICANT':
      return { singular: 'Applicant Task', plural: 'Applicant Tasks', lowercase: 'applicant task' }
    case 'NOTES':
      return { singular: 'Note', plural: 'Notes', lowercase: 'note' }
  }
}

export default function TasksList({ applicationId, initialTasks = [], onTasksChange, taskType, title }: TasksListProps) {
  // Get section-specific labels
  const labels = getSectionLabels(taskType)

  // Filter initial tasks by type and add clientId for stable keys
  const [tasks, setTasks] = useState<Task[]>(() =>
    initialTasks
      .filter(task => task.type === taskType)
      .map(task => ({
        ...task,
        clientId: task.clientId || task.id
      }))
  )
  const [isLoading] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<ToastType>('success')

  // Ref for auto-focusing new task input
  const inputRef = useRef<HTMLDivElement>(null)

  // Ref for debouncing reorder save operations
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastReorderRef = useRef<Task[] | null>(null)

  // Ref for storing original task data when entering edit mode
  const originalTaskRef = useRef<Task | null>(null)

  // Update tasks when initialTasks changes, filtering by type
  useEffect(() => {
    setTasks(
      initialTasks
        .filter(task => task.type === taskType)
        .map(task => ({
          ...task,
          clientId: task.clientId || task.id
        }))
    )
  }, [initialTasks, taskType])

  // Auto-focus input when creating a new task
  useEffect(() => {
    if (editingTaskId?.startsWith('temp-')) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [editingTaskId])

  // Cleanup reorder timeout on unmount
  useEffect(() => {
    return () => {
      if (reorderTimeoutRef.current) {
        clearTimeout(reorderTimeoutRef.current)
      }
    }
  }, [])

  // Add new task
  const handleAddTask = () => {
    // Create a temporary task with a temporary ID
    const tempId = `temp-${Date.now()}`
    const newTask: Task = {
      id: tempId,
      clientId: tempId,
      description: '',
      completed: false,
      type: taskType,
      order: tasks.length, // New tasks get the highest order (will be at the bottom)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to end of list and set it to edit mode
    setTasks(prev => [...prev, newTask])
    setEditingTaskId(tempId)
  }

  // Edit existing task
  const handleEditTask = (task: Task) => {
    // Store original task data for potential cancellation
    originalTaskRef.current = { ...task }
    setEditingTaskId(task.clientId || task.id)
  }

  // Handle task description change
  const handleTaskDescriptionChange = (taskId: string, description: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task =>
        (task.clientId || task.id) === taskId
          ? { ...task, description }
          : task
      )
      onTasksChange?.(updatedTasks)
      return updatedTasks
    })
  }

  const handleCancelEdit = () => {
    // If canceling a temporary task (new task), remove it from the list
    if (editingTaskId?.startsWith('temp-')) {
      setTasks(prev => prev.filter(task => task.id !== editingTaskId))
    } else if (originalTaskRef.current) {
      // Restore original task data
      setTasks(prev => {
        const restoredTasks = prev.map(task =>
          (task.clientId || task.id) === editingTaskId
            ? originalTaskRef.current!
            : task
        )
        onTasksChange?.(restoredTasks)
        return restoredTasks
      })
    }

    setEditingTaskId(null)
    originalTaskRef.current = null
  }

  const handleSaveEdit = async () => {
    if (!editingTaskId) return

    // Get the task being edited
    const taskToSave = tasks.find(t => (t.clientId || t.id) === editingTaskId)
    if (!taskToSave) return

    if (!taskToSave.description.trim()) {
      setToastType('error')
      setToastMessage(`${labels.singular} description is required`)
      return
    }

    setIsSaving(true)
    setToastMessage(null)

    // Check if this is a new task (temporary ID)
    const isNewTask = editingTaskId.startsWith('temp-')

    try {
      if (isNewTask) {
        // Create new task
        const response = await fetch(`/api/applications/${applicationId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: taskToSave.description.trim(),
            type: taskType
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Failed to create ${labels.lowercase}`)
        }

        // Replace temporary task with real task from server
        setTasks(prev => {
          const updatedTasks = prev.map(task =>
            task.id === editingTaskId
              ? { ...data.data, clientId: data.data.id }
              : task
          )
          onTasksChange?.(updatedTasks)
          return updatedTasks
        })
        setToastType('success')
        setToastMessage(`${labels.singular} added successfully!`)
      } else {
        // Update existing task
        const response = await fetch(
          `/api/applications/${applicationId}/tasks/${editingTaskId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: taskToSave.description.trim() })
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Failed to update ${labels.lowercase}`)
        }

        setTasks(prev => {
          const updatedTasks = prev.map(task => (task.id === editingTaskId ? data.data : task))
          onTasksChange?.(updatedTasks)
          return updatedTasks
        })
        setToastType('success')
        setToastMessage(`${labels.singular} updated successfully!`)
      }

      setEditingTaskId(null)
      originalTaskRef.current = null
    } catch (error) {
      setToastType('error')
      setToastMessage(
        error instanceof Error
          ? error.message
          : isNewTask
          ? `Failed to create ${labels.lowercase}`
          : `Failed to update ${labels.lowercase}`
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setDeletingTaskId(taskId)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTaskId) return

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/tasks/${deletingTaskId}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete ${labels.lowercase}`)
      }

      setTasks(prev => {
        const updatedTasks = prev.filter(task => task.id !== deletingTaskId)
        onTasksChange?.(updatedTasks)
        return updatedTasks
      })
      setToastType('success')
      setToastMessage(`${labels.singular} deleted successfully!`)
    } catch (error) {
      setToastType('error')
      setToastMessage(error instanceof Error ? error.message : `Failed to delete ${labels.lowercase}`)
    } finally {
      setShowDeleteModal(false)
      setDeletingTaskId(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setDeletingTaskId(null)
  }

  // Toggle task completion
  const handleToggleTask = async (task: Task) => {
    // Validate task ID format
    if (!task.id || task.id.startsWith('temp-')) {
      console.error('Cannot toggle task with invalid or temporary ID:', task.id)
      setToastType('error')
      setToastMessage(`Cannot update ${labels.lowercase}: Invalid ID. Please save first.`)
      return
    }

    const newCompletedStatus = !task.completed

    console.log('Toggling task completion:', {
      taskId: task.id,
      currentStatus: task.completed,
      newStatus: newCompletedStatus,
      applicationId
    })

    // Optimistically update UI
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, completed: newCompletedStatus } : t))
    )

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: newCompletedStatus })
        }
      )

      const data = await response.json()

      console.log('Task toggle response:', {
        status: response.status,
        ok: response.ok,
        data
      })

      if (!response.ok) {
        throw new Error(data.error || `Failed to toggle ${labels.lowercase}`)
      }

      // Verify the response has the expected structure
      if (!data.data || !data.data.id) {
        console.error('Invalid response structure:', data)
        throw new Error('Invalid response from server')
      }

      // Update with server response
      setTasks(prev => {
        const updatedTasks = prev.map(t => (t.id === task.id ? data.data : t))
        onTasksChange?.(updatedTasks)
        return updatedTasks
      })

      console.log('Task toggled successfully:', {
        taskId: data.data.id,
        completed: data.data.completed
      })
    } catch (error) {
      console.error('Error toggling task:', error)
      // Revert on error
      setTasks(prev =>
        prev.map(t => (t.id === task.id ? { ...t, completed: task.completed } : t))
      )
      setToastType('error')
      setToastMessage(error instanceof Error ? error.message : `Failed to toggle ${labels.lowercase}`)
    }
  }

  // Persist task order to database
  const persistTaskOrder = async (newOrder: Task[], previousTasks: Task[]) => {
    try {
      // Filter out temporary tasks (new tasks being created)
      const taskIds = newOrder
        .filter(task => !task.id.startsWith('temp-'))
        .map(task => task.id)

      // Only persist if there are non-temporary tasks
      if (taskIds.length === 0) {
        return
      }

      const response = await fetch(
        `/api/applications/${applicationId}/tasks/reorder`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskIds })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to reorder ${labels.plural.toLowerCase()}`)
      }

      // Update with server response (includes updated order values)
      setTasks(prev => {
        // Preserve any temporary tasks that might be in edit mode
        const tempTasks = prev.filter(t => t.id.startsWith('temp-'))
        // Filter server response to only include tasks of the correct type (defensive)
        const serverTasks = data.data
          .filter((t: Task) => t.type === taskType)
          .map((t: Task) => ({ ...t, clientId: t.id }))
        const updatedTasks = [...tempTasks, ...serverTasks]
        onTasksChange?.(updatedTasks)
        return updatedTasks
      })

      // Show subtle success feedback
      setToastType('success')
      setToastMessage(`${labels.plural} reordered successfully!`)
    } catch (error) {
      // Revert on error
      setTasks(previousTasks)
      onTasksChange?.(previousTasks)
      setToastType('error')
      setToastMessage(error instanceof Error ? error.message : `Failed to reorder ${labels.plural.toLowerCase()}`)
    }
  }

  // Handle task reordering - called during drag with debounced save
  const handleReorder = (newOrder: Task[]) => {
    // Store previous order for potential rollback
    const previousTasks = lastReorderRef.current || tasks

    // Update visual state immediately for smooth animation
    setTasks(newOrder)
    onTasksChange?.(newOrder)

    // Store current order for reference
    lastReorderRef.current = previousTasks

    // Clear any pending save timeout
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current)
    }

    // Set new timeout to save after drag settles (300ms of no movement)
    reorderTimeoutRef.current = setTimeout(() => {
      persistTaskOrder(newOrder, previousTasks)
      lastReorderRef.current = null
    }, 300)
  }

  if (isLoading) {
    return (
      <>
        <div className="flex items-center gap-[2%]">
          <span className="text-sm sm:text-base font-semibold text-gray-500">Tasks</span>
        </div>
        <div className="text-sm sm:text-base text-gray-600">
          Loading tasks...
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header with Add Task Icon - matches other field labels */}
      <div className="flex items-center gap-[2%]">
        <span className="text-sm sm:text-base font-semibold text-gray-500">
          {title}
        </span>
        <IconPack.Add
          onClick={handleAddTask}
          size="small"
          disabled={isSaving}
        />
      </div>

      {/* Tasks List - Add cursor-wait during save operations */}
      <Reorder.Group
        axis="y"
        values={tasks}
        onReorder={handleReorder}
        className={`flex flex-col gap-[2%] ${isSaving ? 'cursor-wait' : ''}`}
      >
        {/* All Tasks (including new tasks in edit mode) */}
        {tasks.map((task) => (
          <Reorder.Item
            key={task.clientId || task.id}
            value={task}
            id={task.clientId || task.id}
            className={`flex items-start gap-3 ${
              isSaving && editingTaskId === (task.clientId || task.id)
                ? 'cursor-wait'
                : editingTaskId !== (task.clientId || task.id)
                ? 'cursor-grab active:cursor-grabbing'
                : ''
            }`}
            drag={editingTaskId !== (task.clientId || task.id) && !isSaving} // Disable drag when editing or saving
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
            {/* Checkbox */}
            {task.completed ? (
              <IconPack.CheckboxChecked
                onClick={() => handleToggleTask(task)}
                size="small"
                disabled={editingTaskId === (task.clientId || task.id)}
                className="flex-shrink-0 mt-[2px]"
              />
            ) : (
              <IconPack.CheckboxEmpty
                onClick={() => handleToggleTask(task)}
                size="small"
                disabled={editingTaskId === (task.clientId || task.id)}
                className="flex-shrink-0 mt-[2px]"
              />
            )}

            {/* Task Description */}
            <div className={`flex-1 flex flex-col gap-[2%] ${
              isSaving && editingTaskId === (task.clientId || task.id)
                ? 'cursor-wait'
                : editingTaskId !== (task.clientId || task.id)
                ? 'cursor-grab active:cursor-grabbing'
                : ''
            }`}>
              <div className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-900'} ${
                isSaving && editingTaskId === (task.clientId || task.id)
                  ? 'cursor-wait'
                  : editingTaskId !== (task.clientId || task.id)
                  ? 'cursor-grab active:cursor-grabbing'
                  : ''
              }`}>
                <InlineTextField
                  ref={editingTaskId === (task.clientId || task.id) ? inputRef : null}
                  value={task.description}
                  onChange={(value) => handleTaskDescriptionChange(task.clientId || task.id, value)}
                  isEditMode={editingTaskId === (task.clientId || task.id)}
                  placeholder={`${labels.singular} description`}
                  onEnterPress={handleSaveEdit}
                  className={
                    isSaving && editingTaskId === (task.clientId || task.id)
                      ? 'cursor-wait pointer-events-none'
                      : editingTaskId !== (task.clientId || task.id)
                      ? 'cursor-grab active:cursor-grabbing'
                      : ''
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            {editingTaskId === (task.clientId || task.id) ? (
              <div className="flex items-center gap-2">
                <CancelButton onClick={handleCancelEdit} size="small" />
                <SaveButton onClick={handleSaveEdit} disabled={isSaving} size="small" />
              </div>
            ) : (
              <div>
                <TaskMenuButton
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                  taskType={taskType}
                />
              </div>
            )}
          </Reorder.Item>
        ))}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-sm sm:text-base text-gray-400">
            No {labels.plural.toLowerCase()} yet.
          </div>
        )}
      </Reorder.Group>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title={`Delete ${labels.singular}`}
        message={`Are you sure you want to delete this ${labels.lowercase}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDestructive={true}
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

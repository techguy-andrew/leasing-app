'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import TasksList from '@/components/TasksList'

interface Task {
  id: string
  description: string
  completed: boolean
  type: 'AGENT' | 'APPLICANT' | 'NOTES' | 'TODO'
  order: number
  createdAt: string
  updatedAt: string
}

export default function ToDoListPage() {
  const { isLoaded, userId } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      if (!isLoaded || !userId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/tasks')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch tasks')
        }

        setTasks(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [isLoaded, userId])

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My To-Do List</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My To-Do List</h1>
        <p className="text-gray-600">Please sign in to view your to-do list.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My To-Do List</h1>
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My To-Do List</h1>

      <div className="max-w-2xl">
        <TasksList
          initialTasks={tasks}
          onTasksChange={setTasks}
          taskType="TODO"
          title="To-Do Items"
          userLevel={true}
        />
      </div>
    </div>
  )
}

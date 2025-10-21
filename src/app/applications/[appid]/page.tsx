'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useToolBar } from '@/contexts/ToolBarContext'
import ApplicationDetailForm from '@/components/features/applications/ApplicationDetailForm'
import PopUp1 from '@/components/shared/modals/PopUp1'

interface Task {
  id: string
  description: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

interface Application {
  id: number
  status: string
  moveInDate: string
  property: string
  unitNumber: string
  applicant: string
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  tasks: Task[]
}

interface FormData {
  status: string
  moveInDate: string
  property: string
  unitNumber: string
  applicant: string
  email: string
  phone: string
  createdAt: string
}

interface PageProps {
  params: Promise<{ appid: string }>
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appId, setAppId] = useState<number | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const { setOnSendStatusMessage } = useToolBar()

  // Set up toolbar callback
  useEffect(() => {
    setOnSendStatusMessage(() => () => setShowStatusModal(true))
    return () => setOnSendStatusMessage(null)
  }, [setOnSendStatusMessage])

  useEffect(() => {
    async function loadApplication() {
      try {
        const { appid } = await params
        const id = parseInt(appid, 10)

        if (isNaN(id)) {
          setError('Invalid application ID')
          setIsLoading(false)
          return
        }

        setAppId(id)

        const response = await fetch(`/api/applications/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch application')
        }

        setApplication(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadApplication()
  }, [params])

  const handleSave = async (formData: FormData) => {
    if (!appId) throw new Error('No application ID')

    // Normalize date to ensure MM/DD/YYYY format with leading zeros
    const normalizeDate = (dateStr: string): string => {
      const digits = dateStr.replace(/\D/g, '')
      if (digits.length === 8) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
      }
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const [month, day, year] = parts
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year.padStart(4, '0')}`
      }
      return dateStr
    }

    const payload = {
      ...formData,
      moveInDate: normalizeDate(formData.moveInDate),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null
    }

    const response = await fetch(`/api/applications/${appId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update application')
    }

    setApplication(data.data)
  }

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/applications/${id}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete application')
    }

    router.push('/applications')
  }

  const handleStatusChange = async (status: string) => {
    if (!appId || !application) throw new Error('No application ID')

    // Normalize date to ensure MM/DD/YYYY format with leading zeros
    const normalizeDate = (dateStr: string): string => {
      const digits = dateStr.replace(/\D/g, '')
      if (digits.length === 8) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
      }
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const [month, day, year] = parts
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year.padStart(4, '0')}`
      }
      return dateStr
    }

    const payload = {
      applicant: application.applicant,
      createdAt: normalizeDate(application.createdAt),
      moveInDate: normalizeDate(application.moveInDate),
      property: application.property,
      unitNumber: application.unitNumber,
      email: application.email?.trim() || null,
      phone: application.phone?.trim() || null,
      status
    }

    const response = await fetch(`/api/applications/${appId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update status')
    }

    setApplication(data.data)
  }

  const handleCancel = () => {
    // Cancel is handled within ApplicationForm for edit mode
  }

  const handleTasksChange = (updatedTasks: Task[]) => {
    setApplication(prev => {
      if (!prev) return prev
      return {
        ...prev,
        tasks: updatedTasks
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 w-full items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          className="text-lg text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Loading application...
        </motion.div>
      </div>
    )
  }

  if (error && !application) {
    return (
      <div className="flex flex-col flex-1 w-full items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          className="text-lg text-red-600 px-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Error: {error}
        </motion.div>
      </div>
    )
  }

  if (!application || !appId) return null

  return (
    <>
      <ApplicationDetailForm
        mode="edit"
        initialData={{
          status: application.status,
          moveInDate: application.moveInDate,
          property: application.property,
          unitNumber: application.unitNumber,
          applicant: application.applicant,
          email: application.email || '',
          phone: application.phone || '',
          createdAt: application.createdAt || ''
        }}
        initialTasks={application.tasks || []}
        applicationId={appId}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onTasksChange={handleTasksChange}
        showDeleteButton={true}
      />

      {/* Outstanding Tasks Popup */}
      <PopUp1
        isOpen={showStatusModal}
        tasks={application.tasks || []}
        onClose={() => setShowStatusModal(false)}
      />
    </>
  )
}

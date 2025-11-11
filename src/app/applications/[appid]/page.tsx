'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useToolBar } from '@/contexts/ToolBarContext'
import ApplicationDetailForm from '@/components/ApplicationDetailForm'
import StatusMessageModal from '@/components/StatusMessageModal'
import WelcomeMessageModal from '@/components/WelcomeMessageModal'
import LoadingScreen from '@/components/LoadingScreen'
import { fadeIn } from '@/lib/animations/variants'

interface Task {
  id: string
  description: string
  completed: boolean
  type: 'AGENT' | 'APPLICANT' | 'NOTES' | 'TODO'
  order: number
  createdAt: string
  updatedAt: string
}

interface Unit {
  id: number
  unitNumber: string
  property: {
    id: number
    name: string
    street: string
    city: string
    state: string
    zip: string
  }
}

interface UnitOption {
  id: number
  unitNumber: string
  property: {
    name: string
  }
}

interface Application {
  id: number
  status: string[]
  moveInDate: string
  unitId: number | null
  unit?: Unit  // Unit with property relation from API
  personId?: number | null  // Primary applicant's person ID
  property: string  // Legacy field - kept for backward compatibility
  unitNumber: string  // Legacy field - kept for backward compatibility
  applicant: string
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  tasks: Task[]
  deposit: string | null
  rent: string | null
  petFee: string | null
  petRent: string | null
  proratedRent: string | null
  concession: string | null
  rentersInsurance: string | null
  adminFee: string | null
  initialPayment: string | null
  amountPaid: string | null
  remainingBalance: string | null
  propertyAddress?: string | null
  energyProvider?: string | null
}

interface FormData {
  status: string[]
  moveInDate: string
  unitId: string
  applicant: string
  email: string
  phone: string
  createdAt: string
  deposit: string
  rent: string
  petFee: string
  petRent: string
  proratedRent: string
  concession: string
  rentersInsurance: string
  adminFee: string
  initialPayment: string
  amountPaid: string
  remainingBalance: string
}

interface PageProps {
  params: Promise<{ appid: string }>
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [units, setUnits] = useState<UnitOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appId, setAppId] = useState<number | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const { setOnSendStatusMessage, setOnSendWelcomeMessage } = useToolBar()

  // Load application data - extracted for reusability
  const loadApplication = async (id: number) => {
    try {
      const response = await fetch(`/api/applications/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch application')
      }

      setApplication(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Set up toolbar callbacks - refresh data before opening modals
  useEffect(() => {
    setOnSendStatusMessage(() => async () => {
      if (appId) {
        await loadApplication(appId) // Refresh data first
      }
      setShowStatusModal(true) // Then open modal with fresh data
    })
    return () => setOnSendStatusMessage(null)
  }, [setOnSendStatusMessage, appId])

  useEffect(() => {
    setOnSendWelcomeMessage(() => async () => {
      if (appId) {
        await loadApplication(appId) // Refresh data first
      }
      setShowWelcomeModal(true) // Then open modal with fresh data
    })
    return () => setOnSendWelcomeMessage(null)
  }, [setOnSendWelcomeMessage, appId])

  // Initial load on mount
  useEffect(() => {
    async function initialize() {
      try {
        const { appid } = await params
        const id = parseInt(appid, 10)

        if (isNaN(id)) {
          setError('Invalid application ID')
          setIsLoading(false)
          return
        }

        setAppId(id)

        // Fetch application and units in parallel
        const [applicationResponse, unitsResponse] = await Promise.all([
          fetch(`/api/applications/${id}`),
          fetch('/api/units')
        ])

        const applicationData = await applicationResponse.json()
        const unitsData = await unitsResponse.json()

        if (!applicationResponse.ok) {
          throw new Error(applicationData.error || 'Failed to fetch application')
        }

        if (!unitsResponse.ok) {
          throw new Error(unitsData.error || 'Failed to fetch units')
        }

        setApplication(applicationData.data)
        setUnits(unitsData.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [params])

  const handleSave = async (formData: FormData) => {
    if (!appId) throw new Error('No application ID')

    // Normalize date to ensure MM/DD/YYYY format with leading zeros
    const normalizeDate = (dateStr: string): string | null => {
      if (!dateStr || dateStr.trim() === '') return null
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
      unitId: formData.unitId ? parseInt(formData.unitId, 10) : null,
      moveInDate: normalizeDate(formData.moveInDate),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      deposit: formData.deposit.trim() || null,
      rent: formData.rent.trim() || null,
      petFee: formData.petFee.trim() || null,
      petRent: formData.petRent.trim() || null,
      proratedRent: formData.proratedRent.trim() || null,
      concession: formData.concession.trim() || null,
      rentersInsurance: formData.rentersInsurance.trim() || null,
      adminFee: formData.adminFee.trim() || null,
      initialPayment: formData.initialPayment.trim() || null,
      amountPaid: formData.amountPaid.trim() || null,
      remainingBalance: formData.remainingBalance.trim() || null
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

  const handleStatusChange = async (status: string[]) => {
    if (!appId || !application) throw new Error('No application ID')

    // Normalize date to ensure MM/DD/YYYY format with leading zeros
    const normalizeDate = (dateStr: string | null): string | null => {
      if (!dateStr || dateStr.trim() === '') return null
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
      unitId: application.unitId,
      email: application.email?.trim() || null,
      phone: application.phone?.trim() || null,
      status,
      deposit: application.deposit?.trim() || null,
      rent: application.rent?.trim() || null,
      petFee: application.petFee?.trim() || null,
      petRent: application.petRent?.trim() || null,
      proratedRent: application.proratedRent?.trim() || null,
      concession: application.concession?.trim() || null,
      rentersInsurance: application.rentersInsurance?.trim() || null,
      adminFee: application.adminFee?.trim() || null,
      initialPayment: application.initialPayment?.trim() || null,
      amountPaid: application.amountPaid?.trim() || null,
      remainingBalance: application.remainingBalance?.trim() || null
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

  const handleTasksChange = (updatedTasks: Task[], taskType: 'AGENT' | 'APPLICANT' | 'NOTES') => {
    setApplication(prev => {
      if (!prev) return prev

      // Get current tasks of the OTHER type (preserve them)
      const otherTypeTasks = prev.tasks.filter(t => t.type !== taskType)

      // Merge updated tasks with preserved other type tasks
      const mergedTasks = [...updatedTasks, ...otherTypeTasks]

      return {
        ...prev,
        tasks: mergedTasks
      }
    })
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error && !application) {
    return (
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col flex-1 w-full items-center justify-center"
      >
        <div className="text-base text-red-600 px-4 text-center">
          Error: {error}
        </div>
      </motion.div>
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
          unitId: application.unitId?.toString() || '',
          applicant: application.applicant,
          email: application.email || '',
          phone: application.phone || '',
          createdAt: application.createdAt || '',
          deposit: application.deposit || '',
          rent: application.rent || '',
          petFee: application.petFee || '',
          petRent: application.petRent || '',
          proratedRent: application.proratedRent || '',
          concession: application.concession || '',
          rentersInsurance: application.rentersInsurance || '',
          adminFee: application.adminFee || '',
          initialPayment: application.initialPayment || '',
          amountPaid: application.amountPaid || '',
          remainingBalance: application.remainingBalance || ''
        }}
        initialTasks={application.tasks || []}
        units={units}
        personId={application.personId}
        applicationId={appId}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onTasksChange={handleTasksChange}
        showDeleteButton={true}
      />

      {/* Status Message Modal */}
      <StatusMessageModal
        isOpen={showStatusModal}
        applicationData={{
          applicant: application.applicant,
          property: application.property,
          propertyAddress: application.propertyAddress ?? undefined,
          energyProvider: application.energyProvider ?? undefined,
          moveInDate: application.moveInDate,
          deposit: application.deposit,
          rent: application.rent,
          petFee: application.petFee,
          petRent: application.petRent,
          rentersInsurance: application.rentersInsurance,
          adminFee: application.adminFee,
          amountPaid: application.amountPaid,
          remainingBalance: application.remainingBalance,
          tasks: application.tasks || []
        }}
        onClose={() => setShowStatusModal(false)}
      />

      {/* Welcome Message Modal */}
      <WelcomeMessageModal
        isOpen={showWelcomeModal}
        applicationData={{
          applicant: application.applicant,
          property: application.property,
          propertyAddress: application.propertyAddress ?? undefined,
          energyProvider: application.energyProvider ?? undefined,
          moveInDate: application.moveInDate,
          deposit: application.deposit,
          rent: application.rent,
          petFee: application.petFee,
          petRent: application.petRent,
          rentersInsurance: application.rentersInsurance,
          adminFee: application.adminFee,
          amountPaid: application.amountPaid,
          remainingBalance: application.remainingBalance,
          tasks: application.tasks || []
        }}
        onClose={() => setShowWelcomeModal(false)}
      />
    </>
  )
}

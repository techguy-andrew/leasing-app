'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import HeaderCard from '@/components/Cards/HeaderCard'
import InlineTextField from '@/components/Field/InlineTextField'
import InlineSelectField from '@/components/Field/InlineSelectField'
import InlineStatusBadge from '@/components/Badges/InlineStatusBadge'
import EditMenu from '@/components/Buttons/EditMenu/EditMenu'
import Save from '@/components/Buttons/Save/Save'
import Cancel from '@/components/Buttons/Cancel/Cancel'
import Confirm from '@/components/Modals/Confirm'
import Toast, { ToastType } from '@/components/Toast/Toast'

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
}

interface PageProps {
  params: Promise<{ appid: string }>
}

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' }
]

const propertyOptions = [
  { value: 'Burbank Village Apartments', label: 'Burbank Village Apartments' },
  { value: 'Carlisle Apartments', label: 'Carlisle Apartments' },
  { value: 'Clover Hills Apartments', label: 'Clover Hills Apartments' },
  { value: 'Legacy Apartments', label: 'Legacy Apartments' },
  { value: 'Norwalk Village Estates', label: 'Norwalk Village Estates' },
  { value: 'NW Pine Apartments', label: 'NW Pine Apartments' },
  { value: 'Orchard Meadows Apartments', label: 'Orchard Meadows Apartments' },
  { value: 'Parkside Luxury Apartments', label: 'Parkside Luxury Apartments' },
  { value: 'Prairie Village', label: 'Prairie Village' },
  { value: 'West Glen Apartments', label: 'West Glen Apartments' }
]

export default function ApplicationDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<ToastType>('success')

  const [formData, setFormData] = useState({
    status: '',
    moveInDate: '',
    property: '',
    unitNumber: '',
    applicant: '',
    email: '',
    phone: ''
  })

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

        const response = await fetch(`/api/applications`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error('Failed to fetch application')
        }

        const app = data.data.find((a: Application) => a.id === id)

        if (!app) {
          setError('Application not found')
          setIsLoading(false)
          return
        }

        setApplication(app)
        setFormData({
          status: app.status,
          moveInDate: app.moveInDate,
          property: app.property,
          unitNumber: app.unitNumber,
          applicant: app.applicant,
          email: app.email || '',
          phone: app.phone || ''
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadApplication()
  }, [params])

  const formatDate = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDateChange = (value: string) => {
    const formatted = formatDate(value)
    setFormData(prev => ({ ...prev, moveInDate: formatted }))
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  const handleEdit = () => {
    setIsEditMode(true)
    setError(null)
    setToastMessage(null)
  }

  const handleCancel = () => {
    if (application) {
      setFormData({
        status: application.status,
        moveInDate: application.moveInDate,
        property: application.property,
        unitNumber: application.unitNumber,
        applicant: application.applicant,
        email: application.email || '',
        phone: application.phone || ''
      })
    }
    setIsEditMode(false)
    setError(null)
    setToastMessage(null)
  }

  const handleSave = async () => {
    if (!application) return

    setIsSaving(true)
    setError(null)
    setToastMessage(null)

    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update application')
      }

      setApplication(data.data)
      setIsEditMode(false)
      setToastType('success')
      setToastMessage('Application updated successfully!')
    } catch (err) {
      setToastType('error')
      setToastMessage(err instanceof Error ? err.message : 'An error occurred')
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!application) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete application')
      }

      router.push('/applications')
    } catch (err) {
      setToastType('error')
      setToastMessage(err instanceof Error ? err.message : 'An error occurred')
      setError(err instanceof Error ? err.message : 'An error occurred')
      setShowDeleteModal(false)
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-73px)] w-full overflow-y-auto items-center justify-center bg-gradient-to-b from-gray-50 to-white">
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
      <div className="flex flex-col h-[calc(100vh-73px)] w-full overflow-y-auto items-center justify-center bg-gradient-to-b from-gray-50 to-white">
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

  if (!application) return null

  const createdDate = new Date(application.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <HeaderCard
        title={`Application #${application.id}`}
        description={`Submitted on ${createdDate}`}
      />
      <div className="flex flex-col w-full p-4 sm:p-6 md:p-8 lg:p-10">
        <motion.div
          className="max-w-4xl mx-auto w-full bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Application Details</h2>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-1.5">
                <AnimatePresence mode="wait">
                  {!isEditMode ? (
                    <motion.div
                      key="edit-menu"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EditMenu onEdit={handleEdit} onDelete={handleDeleteClick} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="save-cancel"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 sm:gap-2"
                    >
                      <Cancel onClick={handleCancel} />
                      <Save onClick={handleSave} disabled={isSaving} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col gap-5 pt-4 border-t border-gray-200">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Status:</span>
                <InlineStatusBadge
                  status={formData.status}
                  onChange={(value) => handleFieldChange('status', value)}
                  options={statusOptions}
                  isEditMode={isEditMode}
                />
              </div>

              {/* Applicant Name Field */}
              <div className="flex flex-col gap-2.5">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Applicant Name</span>
                <InlineTextField
                  value={formData.applicant}
                  onChange={(value) => handleFieldChange('applicant', value)}
                  isEditMode={isEditMode}
                  placeholder="Applicant Name"
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2.5">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Email</span>
                <InlineTextField
                  value={formData.email}
                  onChange={(value) => handleFieldChange('email', value)}
                  isEditMode={isEditMode}
                  type="email"
                  placeholder="Email"
                />
              </div>

              {/* Phone Field */}
              <div className="flex flex-col gap-2.5">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Phone</span>
                <InlineTextField
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  isEditMode={isEditMode}
                  placeholder="Phone"
                />
              </div>

              {/* Property Field */}
              <div className="flex flex-col gap-2.5">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Property</span>
                <InlineSelectField
                  value={formData.property}
                  onChange={(value) => handleFieldChange('property', value)}
                  options={propertyOptions}
                  isEditMode={isEditMode}
                />
              </div>

              {/* Unit Number Field */}
              <div className="flex flex-col gap-2.5">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Unit Number</span>
                <InlineTextField
                  value={formData.unitNumber}
                  onChange={(value) => handleFieldChange('unitNumber', value)}
                  isEditMode={isEditMode}
                  placeholder="Unit Number"
                />
              </div>

              {/* Move-in Date Field */}
              <div className="flex flex-col gap-2.5">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Move-in Date</span>
                <InlineTextField
                  value={formData.moveInDate}
                  onChange={handleDateChange}
                  isEditMode={isEditMode}
                  placeholder="MM/DD/YYYY"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Confirm
        isOpen={showDeleteModal}
        title="Delete Application"
        message={`Are you sure you want to delete application #${application.id}? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
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
    </div>
  )
}

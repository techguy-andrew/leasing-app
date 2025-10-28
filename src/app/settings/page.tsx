'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import NavBar from '@/components/shared/navigation/NavBar'
import StatusList, { Status } from '@/components/features/settings/StatusList'
import { fadeInUp } from '@/lib/animations/variants'
import { IconPack } from '@/components/shared/icons/IconPack'
import { exportApplicationsToCSV } from '@/components/features/exports/export-data'

export default function SettingsPage() {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStatuses() {
      try {
        const response = await fetch('/api/statuses')
        const data = await response.json()

        if (response.ok) {
          setStatuses(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch statuses:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStatuses()
  }, [])

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)

    const result = await exportApplicationsToCSV()

    if (!result.success) {
      setExportError(result.error || 'Failed to export data')
    }

    setIsExporting(false)
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 w-full">
        <div className="flex flex-col w-full gap-8 p-6">
          {/* Header */}
          <motion.div
            className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-lg"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-lg text-gray-600">
              Manage your application statuses. Create custom status tags to organize and track your applications.
            </p>
          </motion.div>

          {/* Status Management */}
          <motion.div
            className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-lg"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Status Management</h2>
              <p className="text-gray-600">
                Statuses are optional tags that help you organize and filter your applications.
                You can create custom statuses, assign colors, and reorder them by dragging.
              </p>
            </div>

            {isLoading ? (
              <div className="text-gray-600">Loading statuses...</div>
            ) : (
              <StatusList initialStatuses={statuses} onStatusesChange={setStatuses} />
            )}
          </motion.div>

          {/* Data Export */}
          <motion.div
            className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-lg"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Data Export</h2>
              <p className="text-gray-600">
                Download a backup of your applications data as a CSV spreadsheet.
                The export includes property details, move-in dates, statuses, applicant information, and task completion counts.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-fit"
              >
                <IconPack.Download size="default" />
                <span>{isExporting ? 'Exporting...' : 'Export to CSV'}</span>
              </button>

              {exportError && (
                <div className="text-red-600 text-sm">
                  {exportError}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

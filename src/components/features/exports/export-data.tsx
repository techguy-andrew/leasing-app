'use client'

/**
 * CONFIGURABLE CSV EXPORT TEMPLATE
 *
 * This file contains all the logic for exporting application data to CSV.
 * You can easily modify what data gets exported by editing the EXPORT_FIELDS configuration below.
 *
 * To add/remove/modify fields:
 * 1. Edit the EXPORT_FIELDS array to add or remove columns
 * 2. Each field has a 'header' (column name in CSV) and a 'getValue' function (how to get the data)
 * 3. The getValue function receives the full application object with tasks
 */

// ============================================================================
// CONFIGURATION - EDIT THIS TO CHANGE WHAT DATA GETS EXPORTED
// ============================================================================

interface Application {
  id: number
  userId: string | null
  status: string[]
  moveInDate: string
  property: string
  unitNumber: string
  applicant: string
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: Date
  deposit: string | null
  rent: string | null
  petFee: string | null
  petRent: string | null
  proratedRent: string | null
  concession: string | null
  rentersInsurance: string | null
  adminFee: string | null
  tasks: Task[]
}

interface Task {
  id: string
  description: string
  completed: boolean
  type: 'AGENT' | 'APPLICANT' | 'NOTES' | 'TODO'
  order: number
  applicationId: number
  createdAt: Date
  updatedAt: Date
}

interface ExportField {
  header: string
  getValue: (app: Application) => string | number
}

/**
 * Define which fields to export and how to get their values
 * Add, remove, or reorder fields here to customize your export
 */
const EXPORT_FIELDS: ExportField[] = [
  {
    header: 'Property',
    getValue: (app) => app.property
  },
  {
    header: 'Unit Number',
    getValue: (app) => app.unitNumber
  },
  {
    header: 'Move-In Date',
    getValue: (app) => app.moveInDate
  },
  {
    header: 'Status',
    getValue: (app) => app.status.join(', ') // Comma-separated if multiple statuses
  },
  {
    header: 'Name',
    getValue: (app) => app.applicant
  },
  {
    header: 'Completed Agent Tasks',
    getValue: (app) => {
      const tasks = app.tasks.filter(t => t.type === 'AGENT' && t.completed)
      if (tasks.length === 0) return ''
      return tasks.map(t => `• ${t.description}`).join('\n')
    }
  },
  {
    header: 'Outstanding Agent Tasks',
    getValue: (app) => {
      const tasks = app.tasks.filter(t => t.type === 'AGENT' && !t.completed)
      if (tasks.length === 0) return ''
      return tasks.map(t => `• ${t.description}`).join('\n')
    }
  },
  {
    header: 'Completed Applicant Tasks',
    getValue: (app) => {
      const tasks = app.tasks.filter(t => t.type === 'APPLICANT' && t.completed)
      if (tasks.length === 0) return ''
      return tasks.map(t => `• ${t.description}`).join('\n')
    }
  },
  {
    header: 'Outstanding Applicant Tasks',
    getValue: (app) => {
      const tasks = app.tasks.filter(t => t.type === 'APPLICANT' && !t.completed)
      if (tasks.length === 0) return ''
      return tasks.map(t => `• ${t.description}`).join('\n')
    }
  },
  {
    header: 'Completed Notes',
    getValue: (app) => {
      const tasks = app.tasks.filter(t => t.type === 'NOTES' && t.completed)
      if (tasks.length === 0) return ''
      return tasks.map(t => `• ${t.description}`).join('\n')
    }
  },
  {
    header: 'Outstanding Notes',
    getValue: (app) => {
      const tasks = app.tasks.filter(t => t.type === 'NOTES' && !t.completed)
      if (tasks.length === 0) return ''
      return tasks.map(t => `• ${t.description}`).join('\n')
    }
  }
]

// ============================================================================
// OPTIONAL FIELDS - UNCOMMENT TO ADD TO EXPORT
// ============================================================================

/*
// Uncomment any of these to add them to your export:

  {
    header: 'Email',
    getValue: (app) => app.email || ''
  },
  {
    header: 'Phone',
    getValue: (app) => app.phone || ''
  },
  {
    header: 'Application Date',
    getValue: (app) => app.createdAt
  },
  {
    header: 'Security Deposit',
    getValue: (app) => app.deposit || ''
  },
  {
    header: 'Monthly Rent',
    getValue: (app) => app.rent || ''
  },
  {
    header: 'Pet Fee',
    getValue: (app) => app.petFee || ''
  },
  {
    header: 'Pet Rent',
    getValue: (app) => app.petRent || ''
  },
  {
    header: 'Prorated Rent',
    getValue: (app) => app.proratedRent || ''
  },
  {
    header: 'Concession',
    getValue: (app) => app.concession || ''
  },
  {
    header: 'Renters Insurance',
    getValue: (app) => app.rentersInsurance || ''
  },
  {
    header: 'Admin Fee',
    getValue: (app) => app.adminFee || ''
  },
  {
    header: 'Total Tasks',
    getValue: (app) => app.tasks.length
  },
  {
    header: 'Completed Tasks',
    getValue: (app) => app.tasks.filter(t => t.completed).length
  },
  {
    header: 'Outstanding Tasks',
    getValue: (app) => app.tasks.filter(t => !t.completed).length
  }
*/

// ============================================================================
// CSV GENERATION LOGIC - NO NEED TO EDIT BELOW THIS LINE
// ============================================================================

/**
 * Escapes CSV values that contain commas, quotes, or newlines
 */
function escapeCsvValue(value: string | number): string {
  const stringValue = String(value)

  // If the value contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Converts an array of applications to CSV format
 */
function convertToCSV(applications: Application[]): string {
  // Generate header row
  const headers = EXPORT_FIELDS.map(field => field.header).join(',')

  // Generate data rows
  const rows = applications.map(app => {
    const values = EXPORT_FIELDS.map(field => {
      const value = field.getValue(app)
      return escapeCsvValue(value)
    })
    return values.join(',')
  })

  // Combine header and rows
  return [headers, ...rows].join('\n')
}

/**
 * Triggers a browser download of the CSV file
 */
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Generates a filename with current date
 */
function generateFilename(): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD format
  return `applications-backup-${dateStr}.csv`
}

// ============================================================================
// MAIN EXPORT FUNCTION - CALL THIS FROM YOUR UI
// ============================================================================

interface ExportResult {
  success: boolean
  error?: string
}

/**
 * Main function to export applications data to CSV
 * Call this function from your export button onClick handler
 *
 * @returns Promise with success status and optional error message
 */
export async function exportApplicationsToCSV(): Promise<ExportResult> {
  try {
    // Fetch data from API
    const response = await fetch('/api/export/applications')

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success || !result.data) {
      throw new Error('Invalid response from server')
    }

    let applications: Application[] = result.data

    // Filter out archived applications
    applications = applications.filter(app => !app.status.includes('Archived'))

    if (applications.length === 0) {
      throw new Error('No applications to export')
    }

    // Sort by move-in date (oldest to newest)
    // Parse MM/DD/YYYY strings to Date objects for proper chronological sorting
    applications.sort((a, b) => {
      const dateA = new Date(a.moveInDate)
      const dateB = new Date(b.moveInDate)
      return dateA.getTime() - dateB.getTime()
    })

    // Convert to CSV
    const csvContent = convertToCSV(applications)

    // Generate filename and trigger download
    const filename = generateFilename()
    downloadCSV(csvContent, filename)

    return { success: true }
  } catch (error) {
    console.error('Error exporting applications:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export data'
    }
  }
}

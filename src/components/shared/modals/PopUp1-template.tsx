/**
 * Email Template Configuration for PopUp1 Modal
 *
 * This file contains the email template used for sending status messages to applicants.
 * You can easily customize the template by editing the configuration and template sections below.
 *
 * To modify:
 * 1. Edit TEMPLATE_CONFIG to change company info, phone numbers, placeholders, etc.
 * 2. Edit PAYMENT_FIELDS to add/remove/reorder payment fields
 * 3. Edit the generateEmailTemplate function to change the email structure and text
 */

// ============================================================================
// CONFIGURATION SECTION - Edit these values to customize the template
// ============================================================================

export const TEMPLATE_CONFIG = {
  // Company Information
  companyName: 'Coves Living',
  contactPhone: '515-207-3878',

  // Portal Information
  portalName: 'online resident portal',

  // Default Placeholders (shown when data is missing)
  defaultPropertyAddress: '[PROPERTY ADDRESS]',
  defaultEnergyProvider: '[ENERGY COMPANY]',

  // Section Toggles (set to false to hide sections)
  showWelcomeMessage: true,
  showAddress: true,
  showMoveInDate: true,
  showPaymentBreakdown: true,
  showUtilitySetup: true,
  showTasks: true,
  showContactInfo: true,
}

// Payment Fields Configuration
// Add, remove, or reorder payment fields here
// Each field needs: key (database field name), label (display name)
export const PAYMENT_FIELDS = [
  { key: 'deposit', label: 'Deposit' },
  { key: 'rent', label: 'Rent' },
  { key: 'petFee', label: 'Pet Fee' },
  { key: 'rentersInsurance', label: 'Renter\'s Insurance' },
  { key: 'adminFee', label: 'Admin Fee' },
  // Add more fields here as needed:
  // { key: 'parkingFee', label: 'Parking Fee' },
]

// ============================================================================
// HELPER FUNCTIONS - Utility functions for formatting and calculations
// ============================================================================

interface Task {
  id: string
  description: string
  completed: boolean
  type: 'AGENT' | 'APPLICANT' | 'NOTES' | 'TODO'
}

interface ApplicationData {
  applicant: string
  property: string
  propertyAddress?: string
  energyProvider?: string
  moveInDate: string
  deposit: string | null
  rent: string | null
  petFee: string | null
  rentersInsurance: string | null
  adminFee: string | null
  tasks: Task[]
}

/**
 * Format a number as currency with 2 decimal places
 */
export function formatCurrency(value: string | null): string {
  if (!value) return '0.00'
  const num = parseFloat(value)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

/**
 * Calculate the total initial payment from all payment fields
 */
export function calculateInitialPayment(data: ApplicationData): number {
  let total = 0

  PAYMENT_FIELDS.forEach(field => {
    const value = data[field.key as keyof ApplicationData]
    if (typeof value === 'string') {
      const amount = parseFloat(value || '0')
      total += isNaN(amount) ? 0 : amount
    }
  })

  return total
}

/**
 * Build payment breakdown string with only non-empty fields
 */
export function buildPaymentBreakdown(data: ApplicationData): string {
  const paymentItems: { amount: string; label: string }[] = []

  PAYMENT_FIELDS.forEach(field => {
    const value = data[field.key as keyof ApplicationData]
    if (typeof value === 'string' && value && parseFloat(value) > 0) {
      paymentItems.push({
        amount: formatCurrency(value),
        label: field.label
      })
    }
  })

  const initialPayment = calculateInitialPayment(data)

  if (paymentItems.length > 0) {
    return paymentItems
      .map(item => `$${item.amount} (${item.label})`)
      .join(' + ') + ` = $${initialPayment.toFixed(2)}`
  }

  return `$${initialPayment.toFixed(2)}`
}

/**
 * Get incomplete applicant tasks as a formatted list
 */
export function formatTasksList(tasks: Task[]): string {
  const incompleteApplicantTasks = tasks.filter(
    task => !task.completed && task.type === 'APPLICANT'
  )

  if (incompleteApplicantTasks.length === 0) {
    return 'No outstanding tasks'
  }

  return incompleteApplicantTasks.map(task => `- ${task.description}`).join('\n')
}

// ============================================================================
// MAIN TEMPLATE FUNCTION - Edit the email structure and text here
// ============================================================================

/**
 * Generate the complete email template
 *
 * This is the main function that creates the email text.
 * You can rearrange sections, change text, or add new sections here.
 *
 * @param data - Application data from the database
 * @returns Formatted email string ready to copy
 */
export function generateEmailTemplate(data: ApplicationData): string {
  const config = TEMPLATE_CONFIG
  const initialPayment = calculateInitialPayment(data)
  const propertyAddress = data.propertyAddress || config.defaultPropertyAddress
  const energyProvider = data.energyProvider || config.defaultEnergyProvider
  const paymentBreakdown = buildPaymentBreakdown(data)
  const tasksList = formatTasksList(data.tasks)

  // Build the email template
  // Edit the text below to customize your email

  let template = ''

  // ---- GREETING SECTION ----
  template += `Hello ${data.applicant},\n\n`

  // ---- WELCOME MESSAGE ----
  if (config.showWelcomeMessage) {
    template += `Welcome to ${config.companyName} at ${data.property}!\n\n`
  }

  // ---- ADDRESS SECTION ----
  if (config.showAddress) {
    template += `Address:\n${propertyAddress}\n\n`
  }

  // ---- MOVE-IN DATE SECTION ----
  if (config.showMoveInDate) {
    template += `Your move-in date is scheduled for ${data.moveInDate}.\n\n`
  }

  // ---- LEASE AGREEMENT SECTION ----
  template += `The lease agreement is ready to sign. Please log in to your ${config.portalName} to sign the agreement and make your initial payment as soon as possible.\n\n`

  // ---- PAYMENT BREAKDOWN SECTION ----
  if (config.showPaymentBreakdown && initialPayment > 0) {
    template += `Your initial payment is $${initialPayment.toFixed(2)}. Your initial payment must be made before your move-in date.\n\n`
    template += `${paymentBreakdown}\n\n`
  }

  // ---- UTILITY SETUP SECTION ----
  if (config.showUtilitySetup) {
    template += `Please contact ${energyProvider} to set up the utilities in your name. You must set up your account and provide us with your account number before your move-in date.\n\n`
  }

  // ---- TASKS SECTION ----
  if (config.showTasks) {
    template += `Tasks:\n${tasksList}\n\n`
  }

  // ---- CONTACT INFORMATION SECTION ----
  if (config.showContactInfo) {
    template += `If you have any questions, please call ${config.companyName} at ${config.contactPhone}.`
  }

  return template
}

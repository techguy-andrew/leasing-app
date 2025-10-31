/**
 * Email Template Configuration for Welcome Message Modal
 *
 * This file contains the Welcome Message Template used for welcoming new applicants.
 * You can easily customize the template by editing the configuration and template sections below.
 *
 * To modify:
 * 1. Edit TEMPLATE_CONFIG to change the message text and structure
 * 2. Edit the generateWelcomeTemplate function to change the email structure
 */

// ============================================================================
// CONFIGURATION SECTION - Edit these values to customize the template
// ============================================================================

export const TEMPLATE_CONFIG = {
  // Company name for sign-off
  companyName: 'Coves Living',

  // Company contact phone
  companyPhone: '515-207-3878',

  // Section toggles (set to false to hide sections)
  showPropertyDetails: true,
  showTasks: true,
  showPaymentBreakdown: true,
}

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
  petRent: string | null
  rentersInsurance: string | null
  adminFee: string | null
  amountPaid: string | null
  remainingBalance: string | null
  tasks: Task[]
}

/**
 * Safely parse a string to a number, handling various formats
 * Removes formatting characters like $, commas, and whitespace
 */
function safeParseFloat(value: string | null | undefined): number {
  if (!value) return 0

  // Remove common formatting: $, commas, whitespace
  const cleaned = value.toString().trim()
    .replace(/[$,]/g, '')
    .replace(/\s+/g, '')

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Calculate the initial payment from all payment fields
 * Includes: Rent, Deposit, Insurance, Admin Fee, Pet Fee (if applicable), Pet Rent (if applicable)
 */
export function calculateInitialPayment(data: ApplicationData): number {
  const rent = safeParseFloat(data.rent)
  const deposit = safeParseFloat(data.deposit)
  const insurance = safeParseFloat(data.rentersInsurance)
  const adminFee = safeParseFloat(data.adminFee)
  const petFee = safeParseFloat(data.petFee)
  const petRent = safeParseFloat(data.petRent)

  return rent + deposit + insurance + adminFee + petFee + petRent
}

/**
 * Format a number as currency with commas and 2 decimal places
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
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

  return incompleteApplicantTasks.map(task => task.description).join('\n')
}

// ============================================================================
// MAIN TEMPLATE FUNCTION - Edit the email structure and text here
// ============================================================================

/**
 * Generate the complete welcome email template
 *
 * This is the main function that creates the welcome email text.
 * You can rearrange sections, change text, or add new sections here.
 *
 * @param data - Application data from the database
 * @returns Formatted email string ready to copy
 */
export function generateWelcomeTemplate(data: ApplicationData): string {
  const config = TEMPLATE_CONFIG
  const tasksList = formatTasksList(data.tasks)
  const initialPayment = calculateInitialPayment(data)
  const formattedInitialPayment = formatCurrency(initialPayment)

  // Parse payment tracking fields
  const amountPaid = safeParseFloat(data.amountPaid)
  const remainingBalance = safeParseFloat(data.remainingBalance)
  const formattedAmountPaid = formatCurrency(amountPaid)
  const formattedRemainingBalance = formatCurrency(remainingBalance)

  // Parse individual payment components for itemized breakdown
  const rent = safeParseFloat(data.rent)
  const deposit = safeParseFloat(data.deposit)
  const insurance = safeParseFloat(data.rentersInsurance)
  const adminFee = safeParseFloat(data.adminFee)
  const petFee = safeParseFloat(data.petFee)
  const petRent = safeParseFloat(data.petRent)

  // Build the email template
  let template = ''

  // ---- GREETING ----
  template += `Hello ${data.applicant},\n\n`

  // ---- WELCOME MESSAGE ----
  template += `Welcome to ${config.companyName} at ${data.property}!\n\n`

  // ---- PROPERTY ADDRESS ----
  if (config.showPropertyDetails && data.propertyAddress) {
    template += `Address:\n${data.propertyAddress}\n\n`
  }

  // ---- MOVE-IN DATE ----
  template += `Your move-in date is scheduled for ${data.moveInDate}.\n\n`

  // ---- LEASE SIGNING INSTRUCTIONS ----
  template += `The lease agreement is ready to sign. Please log in to your online resident portal to sign the agreement and make your initial payment as soon as possible.\n\n`
  template += `Your initial payment must be made before your move-in date.\n\n`

  // ---- PAYMENT SUMMARY ----
  template += `Move-In Date: ${data.moveInDate}\n`
  template += `Initial Payment: $${formattedInitialPayment}\n`
  template += `Amount Paid: $${formattedAmountPaid}\n`
  template += `Remaining Balance: $${formattedRemainingBalance}\n\n`

  // ---- PAYMENT BREAKDOWN ----
  if (config.showPaymentBreakdown) {
    template += `Initial Payment Breakdown:\n`
    template += `Rent: $${formatCurrency(rent)}\n`
    template += `Deposit: $${formatCurrency(deposit)}\n`
    template += `Insurance: $${formatCurrency(insurance)}\n`
    template += `Admin Fee: $${formatCurrency(adminFee)}\n`

    // Only show pet items if applicable (> 0)
    if (petFee > 0) {
      template += `(If Applicable) Pet Fee: $${formatCurrency(petFee)}\n`
    }
    if (petRent > 0) {
      template += `(If Applicable) Pet Rent: $${formatCurrency(petRent)}\n`
    }

    template += `Total Initial Payment: $${formattedInitialPayment}\n\n`
    template += `Due before move-in: $${formattedInitialPayment} (Total Initial Payment)\n\n`
  }

  // ---- UTILITY SETUP INSTRUCTIONS ----
  if (data.energyProvider) {
    template += `Please contact ${data.energyProvider} to set up the utilities. You must set up your account(s) and provide us with proof of activation before your move-in date.\n\n`
  }

  // ---- OUTSTANDING TASKS ----
  if (config.showTasks) {
    template += `Outstanding Tasks:\n${tasksList}\n\n`
  }

  // ---- WARNING AND SUPPORT MESSAGE ----
  template += `These items are required and must be completed prior to move-in. Failure to complete them may result in a delay or rescheduling of your move-in date. We understand that moving can be busy, and we're here to support you through this process. If you're facing any difficulties or have questions about completing these requirements, please reach out to us directly so we can work together to get everything handled. Thank you for your attention to this matter. We're committed to ensuring your move-in goes smoothly.\n\n`

  // ---- CONTACT INFORMATION ----
  template += `If you have any questions, please call ${config.companyName} at ${config.companyPhone}.\n\n`

  // ---- SIGN-OFF ----
  template += `Best regards,`

  return template
}

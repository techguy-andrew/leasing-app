/**
 * Default Tasks Configuration for New Applications
 *
 * This file defines the default tasks that are automatically created
 * when a new application is submitted.
 *
 * ============================================================
 * HOW TO DISABLE DEFAULT TASKS:
 * ============================================================
 *
 * Option 1 - Disable all default tasks:
 * Set USE_DEFAULT_TASKS to false:
 *   export const USE_DEFAULT_TASKS = false
 *
 * Option 2 - Return empty array from getDefaultTasks:
 *   export function getDefaultTasks() {
 *     return []
 *   }
 *
 * ============================================================
 * HOW TO ADD NEW DEFAULT TASKS:
 * ============================================================
 *
 * Add a new object to the DEFAULT_TASKS array below with:
 * - description: String describing what needs to be done
 * - completed: Boolean (usually false for new tasks)
 *
 * Example:
 * {
 *   description: 'Submit proof of income',
 *   completed: false
 * }
 *
 * The 'id' field is automatically generated when the task is created.
 * Tasks will be ordered based on their position in the array.
 *
 * ============================================================
 * TASK TYPES:
 * ============================================================
 *
 * Tasks have a 'type' field that can be either:
 * - AGENT: Tasks for the leasing agent to complete
 * - APPLICANT: Tasks for the applicant to complete
 *
 * Default tasks created through this system are APPLICANT type,
 * meaning they appear in the "Applicant Tasks" section and are
 * intended for the applicant to complete.
 *
 * AGENT tasks can be added through the UI on the application
 * detail page.
 *
 * ============================================================
 */

// Set to false to disable automatic task creation
export const USE_DEFAULT_TASKS = true

// Default tasks that will be created for each new application
const DEFAULT_TASKS = [
  {
    description: '1. Sign the lease agreement.',
    completed: false
  },
  {
    description: '2. Make your initial payment.',
    completed: false
  },
  {
    description: '3. Provide us with your utilities account number.',
    completed: false
  }
]

/**
 * Returns the default tasks for a new application
 * with auto-generated IDs
 *
 * @returns Array of task objects ready to be sent to the API
 */
export function getDefaultTasks() {
  if (!USE_DEFAULT_TASKS) {
    return []
  }

  return DEFAULT_TASKS.map((task) => ({
    id: generateTaskId(),
    description: task.description,
    completed: task.completed,
    type: 'APPLICANT' as const
  }))
}

/**
 * Generates a unique ID for a task
 * Uses a timestamp-based approach with random suffix
 *
 * @returns A unique task ID string
 */
function generateTaskId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 9)
  return `task_${timestamp}_${randomStr}`
}

/**
 * Get a count of how many default tasks will be created
 * Useful for displaying information to the user
 *
 * @returns Number of default tasks
 */
export function getDefaultTaskCount(): number {
  return USE_DEFAULT_TASKS ? DEFAULT_TASKS.length : 0
}

/**
 * Check if default tasks are enabled
 *
 * @returns Boolean indicating if default tasks will be created
 */
export function areDefaultTasksEnabled(): boolean {
  return USE_DEFAULT_TASKS && DEFAULT_TASKS.length > 0
}

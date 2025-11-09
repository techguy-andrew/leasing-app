/**
 * Default Agent Tasks Configuration for New Applications
 *
 * This file defines the default agent tasks that are automatically created
 * when a new application is submitted.
 *
 * ============================================================
 * HOW TO DISABLE DEFAULT AGENT TASKS:
 * ============================================================
 *
 * Option 1 - Disable all default agent tasks:
 * Set USE_DEFAULT_AGENT_TASKS to false:
 *   export const USE_DEFAULT_AGENT_TASKS = false
 *
 * Option 2 - Return empty array from getDefaultAgentTasks:
 *   export function getDefaultAgentTasks() {
 *     return []
 *   }
 *
 * ============================================================
 * HOW TO ADD NEW DEFAULT AGENT TASKS:
 * ============================================================
 *
 * Add a new object to the DEFAULT_AGENT_TASKS array below with:
 * - description: String describing what needs to be done
 * - completed: Boolean (usually false for new tasks)
 *
 * Example:
 * {
 *   description: 'Verify employment information',
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
 * Default tasks created through this system are AGENT type,
 * meaning they appear in the "Agent Tasks" section and are
 * intended for the leasing agent to complete.
 *
 * APPLICANT tasks are defined in applicantDefaultTasks.ts
 *
 * ============================================================
 */

// Set to false to disable automatic agent task creation
export const USE_DEFAULT_AGENT_TASKS = true

// Default agent tasks that will be created for each new application
const DEFAULT_AGENT_TASKS = [
  {
    description: '1. Acknowledgement',
    completed: false
  },
  {
    description: '2. Screening',
    completed: false
  },
  {
    description: '3. Approval Message',
    completed: false
  },
  {
    description: '4. Lease Agreement',
    completed: false
  },
  {
    description: '5. Welcome Message',
    completed: false
  },
  {
    description: '6. Arrange Move-In',
    completed: false
  }
]

/**
 * Returns the default agent tasks for a new application
 * with auto-generated IDs
 *
 * @returns Array of agent task objects ready to be sent to the API
 */
export function getDefaultAgentTasks() {
  if (!USE_DEFAULT_AGENT_TASKS) {
    return []
  }

  return DEFAULT_AGENT_TASKS.map((task) => ({
    id: generateTaskId(),
    description: task.description,
    completed: task.completed,
    type: 'AGENT' as const
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
 * Get a count of how many default agent tasks will be created
 * Useful for displaying information to the user
 *
 * @returns Number of default agent tasks
 */
export function getDefaultAgentTaskCount(): number {
  return USE_DEFAULT_AGENT_TASKS ? DEFAULT_AGENT_TASKS.length : 0
}

/**
 * Check if default agent tasks are enabled
 *
 * @returns Boolean indicating if default agent tasks will be created
 */
export function areDefaultAgentTasksEnabled(): boolean {
  return USE_DEFAULT_AGENT_TASKS && DEFAULT_AGENT_TASKS.length > 0
}

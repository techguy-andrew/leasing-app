/**
 * Seed Default Tasks Script
 *
 * This script adds default tasks to existing applications that don't have tasks yet.
 * It's safe to run multiple times - it will skip applications that already have tasks.
 *
 * Usage:
 *   npx tsx scripts/seedDefaultTasks.ts
 *
 * OR with ts-node:
 *   npx ts-node scripts/seedDefaultTasks.ts
 *
 * Make sure you have tsx or ts-node installed:
 *   npm install -D tsx
 *   OR
 *   npm install -D ts-node
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default tasks configuration (same as in applicantDefaultTasks.ts)
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
 * Generates a unique ID for a task
 */
function generateTaskId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 9)
  return `task_${timestamp}_${randomStr}`
}

/**
 * Main seeding function
 */
async function seedDefaultTasks() {
  console.log('🌱 Starting to seed default tasks...\n')

  try {
    // Get all applications with their tasks
    const applications = await prisma.application.findMany({
      include: {
        tasks: true
      }
    })

    console.log(`📊 Found ${applications.length} total applications\n`)

    let updatedCount = 0
    let skippedCount = 0

    for (const application of applications) {
      // Skip applications that already have tasks
      if (application.tasks.length > 0) {
        console.log(`⏭️  Skipping application ${application.id} (${application.applicant}) - already has ${application.tasks.length} tasks`)
        skippedCount++
        continue
      }

      // Create default tasks for this application
      const tasksToCreate = DEFAULT_TASKS.map((task, index) => ({
        id: generateTaskId(),
        description: task.description,
        completed: task.completed,
        applicationId: application.id,
        order: index,
        type: 'APPLICANT' // Default to AGENT type
      }))

      // Use a transaction to create all tasks at once
      await prisma.$transaction(
        tasksToCreate.map((task) => {
          // Ensure 'type' is actually of the correct enum type (TaskType)
          // Assuming TaskType is imported from your Prisma client:
          //
          // import { TaskType } from '@prisma/client'
          //
          return prisma.task.create({
            data: {
              ...task,
              type: 'APPLICANT', // You may want to use TaskType.AGENT if type is an enum
            }
          })
        })
      )

      console.log(`✅ Added ${DEFAULT_TASKS.length} default tasks to application ${application.id} (${application.applicant})`)
      updatedCount++
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ Seeding complete!')
    console.log(`📈 Statistics:`)
    console.log(`   - Applications updated: ${updatedCount}`)
    console.log(`   - Applications skipped: ${skippedCount}`)
    console.log(`   - Total applications: ${applications.length}`)
    console.log(`   - Tasks added per application: ${DEFAULT_TASKS.length}`)
    console.log(`   - Total tasks created: ${updatedCount * DEFAULT_TASKS.length}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error seeding default tasks:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding function
seedDefaultTasks()
  .then(() => {
    console.log('\n🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reorderSchema = z.object({
  taskIds: z.array(z.string()).min(1, 'Task IDs array is required')
})

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = reorderSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errors
        },
        { status: 400 }
      )
    }

    const { taskIds } = validationResult.data

    // Fetch all user tasks to verify ownership
    const userTasks = await prisma.task.findMany({
      where: {
        userId,
        type: 'TODO'
      }
    })

    const tasksMap = new Map(userTasks.map(t => [t.id, t]))

    // Verify all tasks belong to this user
    for (const taskId of taskIds) {
      if (!tasksMap.has(taskId)) {
        return NextResponse.json(
          { error: `Task ${taskId} does not belong to this user` },
          { status: 403 }
        )
      }
    }

    // Verify all tasks are TODO type
    for (const taskId of taskIds) {
      const task = tasksMap.get(taskId)
      if (task && task.type !== 'TODO') {
        return NextResponse.json(
          { error: 'All tasks in reorder must be TODO type' },
          { status: 400 }
        )
      }
    }

    // Update task order in a transaction with two-phase approach to avoid unique constraint conflicts
    // Phase 1: Set all tasks to temporary high order values (offset by 10000)
    // Phase 2: Update to final order values
    await prisma.$transaction(async (tx) => {
      // Phase 1: Move to temporary positions to avoid conflicts
      for (let i = 0; i < taskIds.length; i++) {
        await tx.task.update({
          where: { id: taskIds[i] },
          data: { order: 10000 + i }
        })
      }

      // Phase 2: Update to final order values
      for (let i = 0; i < taskIds.length; i++) {
        await tx.task.update({
          where: { id: taskIds[i] },
          data: { order: i }
        })
      }
    })

    // Fetch updated tasks
    const updatedTasks = await prisma.task.findMany({
      where: {
        userId,
        type: 'TODO'
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(
      { success: true, data: updatedTasks },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error reordering tasks:', error)
    return NextResponse.json(
      { error: 'Failed to reorder tasks' },
      { status: 500 }
    )
  }
}

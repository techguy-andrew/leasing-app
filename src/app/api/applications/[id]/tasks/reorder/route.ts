import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const reorderSchema = z.object({
  taskIds: z.array(z.string()).min(1, 'Task IDs array is required')
})

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const applicationId = parseInt(id, 10)

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      )
    }

    // Verify the application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { tasks: true }
    })

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
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

    // Verify all tasks belong to this application and get their types
    const tasksMap = new Map(existingApplication.tasks.map(t => [t.id, t]))

    for (const taskId of taskIds) {
      if (!tasksMap.has(taskId)) {
        return NextResponse.json(
          { error: `Task ${taskId} does not belong to this application` },
          { status: 403 }
        )
      }
    }

    // Determine the task type from the first task (all tasks in reorder must be same type)
    const firstTask = tasksMap.get(taskIds[0])
    if (!firstTask) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      )
    }

    const taskType = firstTask.type

    // Verify all tasks are of the same type
    for (const taskId of taskIds) {
      const task = tasksMap.get(taskId)
      if (task && task.type !== taskType) {
        return NextResponse.json(
          { error: 'All tasks in reorder must be of the same type' },
          { status: 400 }
        )
      }
    }

    // Update task order in a transaction
    await prisma.$transaction(
      taskIds.map((taskId, index) =>
        prisma.task.update({
          where: { id: taskId },
          data: { order: index }
        })
      )
    )

    // Fetch updated tasks - ONLY return tasks of the type being reordered
    const updatedTasks = await prisma.task.findMany({
      where: {
        applicationId,
        type: taskType
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

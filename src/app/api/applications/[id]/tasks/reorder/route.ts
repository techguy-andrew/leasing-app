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

    // Verify all tasks belong to this application
    const taskIdsSet = new Set(taskIds)
    const applicationTaskIds = new Set(existingApplication.tasks.map(t => t.id))

    for (const taskId of taskIds) {
      if (!applicationTaskIds.has(taskId)) {
        return NextResponse.json(
          { error: `Task ${taskId} does not belong to this application` },
          { status: 403 }
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

    // Fetch updated tasks
    const updatedTasks = await prisma.task.findMany({
      where: { applicationId },
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

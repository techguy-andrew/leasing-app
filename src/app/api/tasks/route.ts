import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const taskCreateSchema = z.object({
  description: z.string().min(1, 'Task description is required'),
  type: z.enum(['TODO']).default('TODO')
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all user-level tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        type: 'TODO'
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(
      { success: true, data: tasks },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = taskCreateSchema.safeParse(body)

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

    const { description, type } = validationResult.data

    // Get the maximum order value for user tasks
    const maxOrderTask = await prisma.task.findFirst({
      where: {
        userId,
        type
      },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    // Set new task order to max + 1, or 0 if no tasks exist
    const newOrder = maxOrderTask ? maxOrderTask.order + 1 : 0

    // Create the task
    const task = await prisma.task.create({
      data: {
        description,
        completed: false,
        type,
        order: newOrder,
        userId
      }
    })

    return NextResponse.json(
      { success: true, data: task },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

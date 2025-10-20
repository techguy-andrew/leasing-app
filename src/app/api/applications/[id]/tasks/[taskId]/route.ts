import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string; taskId: string }>
}

const taskUpdateSchema = z.object({
  description: z.string().min(1, 'Task description is required')
})

const taskToggleSchema = z.object({
  completed: z.boolean()
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

    const { id, taskId } = await params
    const applicationId = parseInt(id, 10)

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      )
    }

    // Verify the task exists and belongs to the application
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    if (existingTask.applicationId !== applicationId) {
      return NextResponse.json(
        { error: 'Task does not belong to this application' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validationResult = taskUpdateSchema.safeParse(body)

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

    const { description } = validationResult.data

    // Update the task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { description }
    })

    return NextResponse.json(
      { success: true, data: task },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, taskId } = await params
    const applicationId = parseInt(id, 10)

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      )
    }

    // Verify the task exists and belongs to the application
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    if (existingTask.applicationId !== applicationId) {
      return NextResponse.json(
        { error: 'Task does not belong to this application' },
        { status: 403 }
      )
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json(
      { success: true, message: 'Task deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, taskId } = await params
    const applicationId = parseInt(id, 10)

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      )
    }

    // Verify the task exists and belongs to the application
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    if (existingTask.applicationId !== applicationId) {
      return NextResponse.json(
        { error: 'Task does not belong to this application' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validationResult = taskToggleSchema.safeParse(body)

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

    const { completed } = validationResult.data

    // Toggle the task completion status
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completed }
    })

    return NextResponse.json(
      { success: true, data: task },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error toggling task:', error)
    return NextResponse.json(
      { error: 'Failed to toggle task' },
      { status: 500 }
    )
  }
}

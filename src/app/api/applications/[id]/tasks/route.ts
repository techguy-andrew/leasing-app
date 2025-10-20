import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const taskCreateSchema = z.object({
  description: z.string().min(1, 'Task description is required')
})

export async function POST(request: NextRequest, { params }: RouteParams) {
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
      where: { id: applicationId }
    })

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
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

    const { description } = validationResult.data

    // Create the task
    const task = await prisma.task.create({
      data: {
        description,
        completed: false,
        applicationId
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

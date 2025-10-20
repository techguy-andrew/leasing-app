import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { applicationUpdateSchema } from '@/lib/validations/application'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: application },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()

    // Validate request body with Zod
    const validationResult = applicationUpdateSchema.safeParse(body)

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

    const { applicant, createdAt, moveInDate, property, unitNumber, email, phone, status, tasks } = validationResult.data

    // Verify the application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        tasks: true
      }
    })

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: {
      status: string
      createdAt: string
      moveInDate: string
      property: string
      unitNumber: string
      applicant: string
      email: string | null
      phone: string | null
      tasks?: {
        deleteMany?: { id: { in: string[] } }
        updateMany: { where: { id: string }; data: { description: string; completed: boolean } }[]
        create: { id: string; description: string; completed: boolean }[]
      }
    } = {
      status: status || existingApplication.status,
      createdAt,
      moveInDate,
      property,
      unitNumber,
      applicant,
      email,
      phone
    }

    // Only process tasks if they are explicitly provided and not empty
    if (tasks && tasks.length > 0) {
      // Get existing task IDs
      const existingTaskIds = new Set(existingApplication.tasks.map(t => t.id))
      const newTaskIds = new Set(tasks.map(t => t.id))

      // Find tasks to delete (exist in DB but not in new data)
      const tasksToDelete = existingApplication.tasks
        .filter(t => !newTaskIds.has(t.id))
        .map(t => t.id)

      // Find tasks to update (exist in both)
      const tasksToUpdate = tasks.filter(t => existingTaskIds.has(t.id))

      // Find tasks to create (in new data but not in DB)
      const tasksToCreate = tasks.filter(t => !existingTaskIds.has(t.id))

      updateData.tasks = {
        // Delete removed tasks
        deleteMany: tasksToDelete.length > 0 ? {
          id: { in: tasksToDelete }
        } : undefined,
        // Update existing tasks
        updateMany: tasksToUpdate.map(task => ({
          where: { id: task.id },
          data: {
            description: task.description,
            completed: task.completed
          }
        })),
        // Create new tasks
        create: tasksToCreate.map(task => ({
          id: task.id,
          description: task.description,
          completed: task.completed
        }))
      }
    }

    // Update the application in the database
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    return NextResponse.json(
      { success: true, data: application },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
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

    // Delete the application from the database
    await prisma.application.delete({
      where: { id: applicationId }
    })

    return NextResponse.json(
      { success: true, message: 'Application deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}

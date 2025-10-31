import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const statusUpdateSchema = z.object({
  name: z.string().min(1, 'Status name is required').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code').optional()
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

    // Verify the status exists and belongs to the user
    const existingStatus = await prisma.status.findUnique({
      where: { id }
    })

    if (!existingStatus) {
      return NextResponse.json(
        { error: 'Status not found' },
        { status: 404 }
      )
    }

    if (existingStatus.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validationResult = statusUpdateSchema.safeParse(body)

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

    // Check if renaming to a duplicate name
    if (validationResult.data.name && validationResult.data.name !== existingStatus.name) {
      const duplicateStatus = await prisma.status.findFirst({
        where: {
          userId,
          name: validationResult.data.name,
          id: { not: id }
        }
      })

      if (duplicateStatus) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: [{
              field: 'name',
              message: 'A status with this name already exists'
            }]
          },
          { status: 400 }
        )
      }
    }

    // Update the status and cascade name changes to applications
    const updatedStatus = await prisma.$transaction(async (tx) => {
      // Update the status
      const updated = await tx.status.update({
        where: { id },
        data: validationResult.data
      })

      // If name is being changed, update all applications using this status
      if (validationResult.data.name && validationResult.data.name !== existingStatus.name) {
        const oldName = existingStatus.name
        const newName = validationResult.data.name

        // Find all applications with the old status name
        const applicationsWithStatus = await tx.application.findMany({
          where: {
            userId,
            status: {
              has: oldName
            }
          }
        })

        // Update each application's status array
        for (const app of applicationsWithStatus) {
          const updatedStatuses = app.status.map(s => s === oldName ? newName : s)
          await tx.application.update({
            where: { id: app.id },
            data: { status: updatedStatuses }
          })
        }
      }

      return updated
    })

    return NextResponse.json(
      { success: true, data: updatedStatus },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify the status exists and belongs to the user
    const existingStatus = await prisma.status.findUnique({
      where: { id }
    })

    if (!existingStatus) {
      return NextResponse.json(
        { error: 'Status not found' },
        { status: 404 }
      )
    }

    if (existingStatus.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if status is being used by any applications
    const applicationsUsingStatus = await prisma.application.findMany({
      where: {
        userId,
        status: {
          has: existingStatus.name
        }
      },
      select: { id: true }
    })

    if (applicationsUsingStatus.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete status',
          message: `This status is currently being used by ${applicationsUsingStatus.length} application(s). Please remove it from those applications first.`,
          applicationsCount: applicationsUsingStatus.length
        },
        { status: 409 }
      )
    }

    // Delete the status
    await prisma.status.delete({
      where: { id }
    })

    return NextResponse.json(
      { success: true, message: 'Status deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting status:', error)
    return NextResponse.json(
      { error: 'Failed to delete status' },
      { status: 500 }
    )
  }
}

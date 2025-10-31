import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const statusCreateSchema = z.object({
  name: z.string().min(1, 'Status name is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code').default('#6B7280')
})

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all statuses for the user, ordered by order field
    const statuses = await prisma.status.findMany({
      where: { userId },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(
      { success: true, data: statuses },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching statuses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statuses' },
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
    const validationResult = statusCreateSchema.safeParse(body)

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

    const { name, color } = validationResult.data

    // Check if a status with this name already exists for this user
    const existingStatus = await prisma.status.findFirst({
      where: {
        userId,
        name
      }
    })

    if (existingStatus) {
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

    // Get the maximum order value for statuses
    const maxOrderStatus = await prisma.status.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    // Set new status order to max + 1, or 0 if no statuses exist
    const newOrder = maxOrderStatus ? maxOrderStatus.order + 1 : 0

    // Create the status
    const status = await prisma.status.create({
      data: {
        name,
        color,
        order: newOrder,
        userId
      }
    })

    return NextResponse.json(
      { success: true, data: status },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating status:', error)
    return NextResponse.json(
      { error: 'Failed to create status' },
      { status: 500 }
    )
  }
}

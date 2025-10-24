import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reorderSchema = z.object({
  statusIds: z.array(z.string()).min(1, 'Status IDs array is required')
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

    const { statusIds } = validationResult.data

    // Verify all statuses belong to this user
    const userStatuses = await prisma.status.findMany({
      where: { userId }
    })

    const userStatusIds = new Set(userStatuses.map(s => s.id))

    for (const statusId of statusIds) {
      if (!userStatusIds.has(statusId)) {
        return NextResponse.json(
          { error: `Status ${statusId} does not belong to this user` },
          { status: 403 }
        )
      }
    }

    // Update status order in a transaction with two-phase approach to avoid unique constraint conflicts
    // Phase 1: Set all statuses to temporary high order values (offset by 10000)
    // Phase 2: Update to final order values
    await prisma.$transaction(async (tx) => {
      // Phase 1: Move to temporary positions to avoid conflicts
      for (let i = 0; i < statusIds.length; i++) {
        await tx.status.update({
          where: { id: statusIds[i] },
          data: { order: 10000 + i }
        })
      }

      // Phase 2: Update to final order values
      for (let i = 0; i < statusIds.length; i++) {
        await tx.status.update({
          where: { id: statusIds[i] },
          data: { order: i }
        })
      }
    })

    // Fetch updated statuses
    const updatedStatuses = await prisma.status.findMany({
      where: { userId },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(
      { success: true, data: updatedStatuses },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error reordering statuses:', error)
    return NextResponse.json(
      { error: 'Failed to reorder statuses' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all applications with tasks, ordered by moveInDate ascending
    const applications = await prisma.application.findMany({
      where: {
        userId: userId
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        moveInDate: 'asc'
      }
    })

    return NextResponse.json(
      { success: true, data: applications },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching applications for export:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications for export' },
      { status: 500 }
    )
  }
}

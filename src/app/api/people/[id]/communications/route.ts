import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createCommunicationSchema } from '@/lib/validations/communication'

// GET /api/people/[id]/communications - Fetch all communications for a person
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get person ID from URL
    const { id } = await context.params
    const personId = parseInt(id, 10)

    if (isNaN(personId)) {
      return NextResponse.json({ error: 'Invalid person ID' }, { status: 400 })
    }

    // Verify person exists and belongs to user
    const person = await prisma.person.findFirst({
      where: {
        id: personId,
        userId
      }
    })

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    // Fetch communications ordered by creation date (oldest first)
    const communications = await prisma.communication.findMany({
      where: {
        personId,
        userId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({ data: communications }, { status: 200 })
  } catch (error) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    )
  }
}

// POST /api/people/[id]/communications - Create new communication
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get person ID from URL
    const { id } = await context.params
    const personId = parseInt(id, 10)

    if (isNaN(personId)) {
      return NextResponse.json({ error: 'Invalid person ID' }, { status: 400 })
    }

    // Verify person exists and belongs to user
    const person = await prisma.person.findFirst({
      where: {
        id: personId,
        userId
      }
    })

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createCommunicationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { type, content } = validation.data

    // Get current user info from Clerk
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    const senderName = user.fullName || user.emailAddresses[0]?.emailAddress || 'User'
    const senderImageUrl = user.imageUrl || null

    // Create communication
    const communication = await prisma.communication.create({
      data: {
        userId,
        personId,
        type,
        content,
        direction: 'SENT', // All user-created communications are sent
        senderName,
        senderImageUrl
      }
    })

    return NextResponse.json({ data: communication }, { status: 201 })
  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { error: 'Failed to create communication' },
      { status: 500 }
    )
  }
}

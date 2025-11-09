import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { personCreateSchema } from '@/lib/validations/person'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const people = await prisma.person.findMany({
      orderBy: {
        lastName: 'asc'
      },
      include: {
        applications: {
          include: {
            application: true
          }
        }
      }
    })

    return NextResponse.json(
      { success: true, data: people },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching people:', error)
    return NextResponse.json(
      { error: 'Failed to fetch people' },
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

    // Validate request body with Zod
    const validationResult = personCreateSchema.safeParse(body)

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

    const { firstName, lastName, email, phone, status } = validationResult.data

    // Create the person in the database
    const person = await prisma.person.create({
      data: {
        userId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        status: status || 'Prospect'
      }
    })

    return NextResponse.json(
      { success: true, data: person },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating person:', error)
    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    )
  }
}

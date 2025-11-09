import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { personUpdateSchema } from '@/lib/validations/person'

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
    const personId = parseInt(id, 10)

    if (isNaN(personId)) {
      return NextResponse.json(
        { error: 'Invalid person ID' },
        { status: 400 }
      )
    }

    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        applications: {
          include: {
            application: {
              include: {
                unit: {
                  include: {
                    property: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: person },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching person:', error)
    return NextResponse.json(
      { error: 'Failed to fetch person' },
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
    const personId = parseInt(id, 10)

    if (isNaN(personId)) {
      return NextResponse.json(
        { error: 'Invalid person ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    const validationResult = personUpdateSchema.safeParse(body)

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

    // Verify the person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id: personId }
    })

    if (!existingPerson) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Update status transition dates
    const updateData: any = {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      status
    }

    // Track status transitions
    if (status !== existingPerson.status) {
      if (status === 'Applicant' && !existingPerson.becameApplicant) {
        updateData.becameApplicant = new Date()
      } else if (status === 'Current Resident' && !existingPerson.becameResident) {
        updateData.becameResident = new Date()
      } else if (status === 'Past Resident' && !existingPerson.becamePast) {
        updateData.becamePast = new Date()
      }
    }

    // Update the person in the database
    const person = await prisma.person.update({
      where: { id: personId },
      data: updateData
    })

    return NextResponse.json(
      { success: true, data: person },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating person:', error)
    return NextResponse.json(
      { error: 'Failed to update person' },
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
    const personId = parseInt(id, 10)

    if (isNaN(personId)) {
      return NextResponse.json(
        { error: 'Invalid person ID' },
        { status: 400 }
      )
    }

    // Verify the person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id: personId }
    })

    if (!existingPerson) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Delete the person from the database
    await prisma.person.delete({
      where: { id: personId }
    })

    return NextResponse.json(
      { success: true, message: 'Person deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting person:', error)
    return NextResponse.json(
      { error: 'Failed to delete person' },
      { status: 500 }
    )
  }
}

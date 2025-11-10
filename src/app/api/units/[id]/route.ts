import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { unitUpdateSchema } from '@/lib/validations/unit'

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
    const unitId = parseInt(id, 10)

    if (isNaN(unitId)) {
      return NextResponse.json(
        { error: 'Invalid unit ID' },
        { status: 400 }
      )
    }

    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        property: true,
        applications: {
          include: {
            persons: {
              include: {
                person: true
              }
            },
            tasks: true
          }
        }
      }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: unit },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching unit:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unit' },
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
    const unitId = parseInt(id, 10)

    if (isNaN(unitId)) {
      return NextResponse.json(
        { error: 'Invalid unit ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Convert empty strings to null/undefined for optional numeric fields
    const processedBody = {
      ...body,
      street: body.street === '' ? null : body.street,
      city: body.city === '' ? null : body.city,
      state: body.state === '' ? null : body.state,
      zip: body.zip === '' ? null : body.zip,
      bedrooms: body.bedrooms === '' ? undefined : body.bedrooms,
      bathrooms: body.bathrooms === '' ? undefined : body.bathrooms,
      squareFeet: body.squareFeet === '' ? undefined : body.squareFeet,
      floor: body.floor === '' ? undefined : body.floor,
      baseRent: body.baseRent === '' ? null : body.baseRent,
      availableOn: body.availableOn === '' ? null : body.availableOn ? new Date(body.availableOn) : null
    }

    // Validate request body with Zod
    const validationResult = unitUpdateSchema.safeParse(processedBody)

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

    const { propertyId, unitNumber, street, city, state, zip, bedrooms, bathrooms, squareFeet, floor, baseRent, status, availableOn } = validationResult.data

    // Verify the unit exists
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId }
    })

    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      )
    }

    // Update the unit in the database
    const unit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        propertyId,
        unitNumber,
        street: street || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        squareFeet: squareFeet || null,
        floor: floor || null,
        baseRent: baseRent || null,
        status,
        availableOn: availableOn ? new Date(availableOn) : null
      },
      include: {
        property: true
      }
    })

    return NextResponse.json(
      { success: true, data: unit },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error updating unit:', error)

    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A unit with this number already exists for this property' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update unit' },
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
    const unitId = parseInt(id, 10)

    if (isNaN(unitId)) {
      return NextResponse.json(
        { error: 'Invalid unit ID' },
        { status: 400 }
      )
    }

    // Verify the unit exists
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId }
    })

    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      )
    }

    // Delete the unit from the database
    await prisma.unit.delete({
      where: { id: unitId }
    })

    return NextResponse.json(
      { success: true, message: 'Unit deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting unit:', error)
    return NextResponse.json(
      { error: 'Failed to delete unit' },
      { status: 500 }
    )
  }
}

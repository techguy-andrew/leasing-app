import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { propertyUpdateSchema } from '@/lib/validations/property'

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
    const propertyId = parseInt(id, 10)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        units: {
          orderBy: {
            unitNumber: 'asc'
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: property },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
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
    const propertyId = parseInt(id, 10)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    const validationResult = propertyUpdateSchema.safeParse(body)

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

    const { name, street, city, state, zip, energyProvider } = validationResult.data

    // Verify the property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Update the property in the database
    const property = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name,
        street,
        city,
        state,
        zip,
        energyProvider
      }
    })

    return NextResponse.json(
      { success: true, data: property },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
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
    const propertyId = parseInt(id, 10)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      )
    }

    // Verify the property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Delete the property from the database
    await prisma.property.delete({
      where: { id: propertyId }
    })

    return NextResponse.json(
      { success: true, message: 'Property deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}

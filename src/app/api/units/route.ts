import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { unitCreateSchema } from '@/lib/validations/unit'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const units = await prisma.unit.findMany({
      orderBy: [
        { property: { name: 'asc' } },
        { unitNumber: 'asc' }
      ],
      include: {
        property: true,
        applications: {
          include: {
            persons: {
              include: {
                person: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      { success: true, data: units },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json(
      { error: 'Failed to fetch units' },
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
    const validationResult = unitCreateSchema.safeParse(processedBody)

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

    // Create the unit in the database
    const unit = await prisma.unit.create({
      data: {
        userId,
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
        status: status || 'Vacant',
        availableOn: availableOn ? new Date(availableOn) : null
      },
      include: {
        property: true
      }
    })

    return NextResponse.json(
      { success: true, data: unit },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error creating unit:', error)

    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A unit with this number already exists for this property' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    )
  }
}

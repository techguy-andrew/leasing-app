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

    // Convert empty strings and null to undefined for optional numeric fields
    const processedBody = {
      ...body,
      bedrooms: body.bedrooms === '' || body.bedrooms === null ? undefined : body.bedrooms,
      bathrooms: body.bathrooms === '' || body.bathrooms === null ? undefined : body.bathrooms,
      squareFeet: body.squareFeet === '' || body.squareFeet === null ? undefined : body.squareFeet,
      floor: body.floor === '' || body.floor === null ? undefined : body.floor,
      baseRent: body.baseRent === '' || body.baseRent === null ? null : body.baseRent,
      availableOn: body.availableOn === '' || body.availableOn === null ? null : body.availableOn ? new Date(body.availableOn) : null
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
        street: street === '' ? null : street || null,
        city: city === '' ? null : city || null,
        state: state === '' ? null : state || null,
        zip: zip === '' ? null : zip || null,
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

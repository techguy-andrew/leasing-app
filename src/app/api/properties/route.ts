import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { propertyCreateSchema } from '@/lib/validations/property'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const properties = await prisma.property.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(
      { success: true, data: properties },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
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
    const validationResult = propertyCreateSchema.safeParse(body)

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

    const { name, address, energyProvider } = validationResult.data

    // Create the property in the database
    const property = await prisma.property.create({
      data: {
        userId,
        name,
        address,
        energyProvider
      }
    })

    return NextResponse.json(
      { success: true, data: property },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}

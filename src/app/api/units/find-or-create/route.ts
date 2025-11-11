import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Find or Create Unit API Endpoint
 *
 * Finds an existing unit by property name + unit number, or creates a new one.
 * Used by PDF extraction workflow to automatically resolve units.
 *
 * POST /api/units/find-or-create
 * Body: { propertyName: string, unitNumber: string }
 * Returns: { success: true, unitId: number, created: boolean, unit: Unit }
 */
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
    const { propertyName, unitNumber } = body

    // Validate required fields
    if (!propertyName || !unitNumber) {
      return NextResponse.json(
        { error: 'Property name and unit number are required' },
        { status: 400 }
      )
    }

    // Trim inputs
    const trimmedPropertyName = propertyName.trim()
    const trimmedUnitNumber = unitNumber.trim()

    if (!trimmedPropertyName || !trimmedUnitNumber) {
      return NextResponse.json(
        { error: 'Property name and unit number cannot be empty' },
        { status: 400 }
      )
    }

    // Step 1: Find property by name (case-insensitive)
    const property = await prisma.property.findFirst({
      where: {
        name: {
          equals: trimmedPropertyName,
          mode: 'insensitive'
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        {
          error: `Property not found: "${trimmedPropertyName}"`,
          suggestion: 'Please verify the property name or create the property first.'
        },
        { status: 404 }
      )
    }

    // Step 2: Check if unit already exists
    const existingUnit = await prisma.unit.findUnique({
      where: {
        propertyId_unitNumber: {
          propertyId: property.id,
          unitNumber: trimmedUnitNumber
        }
      },
      include: {
        property: true
      }
    })

    if (existingUnit) {
      return NextResponse.json({
        success: true,
        unitId: existingUnit.id,
        created: false,
        unit: existingUnit,
        message: `Found existing unit: ${property.name} - Unit ${trimmedUnitNumber}`
      })
    }

    // Step 3: Create new unit with minimal required data
    const newUnit = await prisma.unit.create({
      data: {
        userId,
        propertyId: property.id,
        unitNumber: trimmedUnitNumber,
        status: 'Vacant', // Default status for newly created units
      },
      include: {
        property: true
      }
    })

    return NextResponse.json({
      success: true,
      unitId: newUnit.id,
      created: true,
      unit: newUnit,
      message: `Created new unit: ${property.name} - Unit ${trimmedUnitNumber}`
    })

  } catch (error) {
    console.error('Error in find-or-create unit:', error)
    return NextResponse.json(
      { error: 'Failed to find or create unit' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { status, moveInDate, property, unitNumber, name, email, phone } = body

    // Validate required fields
    if (!status || !moveInDate || !property || !unitNumber || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create the application in the database
    const application = await prisma.application.create({
      data: {
        status,
        moveInDate,
        property,
        unitNumber,
        applicant: name, // Map 'name' to 'applicant' field
        email,
        phone,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(
      { success: true, data: application },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

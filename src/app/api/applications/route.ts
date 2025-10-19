import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      { success: true, data: applications },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { status = 'New', moveInDate, property, unitNumber, name, email, phone } = body

    // Validate required fields (only core fields required)
    if (!moveInDate || !property || !unitNumber || !name) {
      return NextResponse.json(
        { error: 'Name, property, unit number, and move-in date are required' },
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
        email: email || null,
        phone: phone || null
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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const applicationId = parseInt(id, 10)

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, moveInDate, property, unitNumber, applicant, email, phone } = body

    // Validate required fields
    if (!moveInDate || !property || !unitNumber || !applicant) {
      return NextResponse.json(
        { error: 'Applicant name, property, unit number, and move-in date are required' },
        { status: 400 }
      )
    }

    // Update the application in the database
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status || 'New',
        moveInDate,
        property,
        unitNumber,
        applicant,
        email: email || null,
        phone: phone || null
      }
    })

    return NextResponse.json(
      { success: true, data: application },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const applicationId = parseInt(id, 10)

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      )
    }

    // Delete the application from the database
    await prisma.application.delete({
      where: { id: applicationId }
    })

    return NextResponse.json(
      { success: true, message: 'Application deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}

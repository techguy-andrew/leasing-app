import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { applicationCreateSchema } from '@/lib/validations/application'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    const validationResult = applicationCreateSchema.safeParse(body)

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

    const { name, createdAt, moveInDate, unitId, email, phone, status, tasks, deposit, rent, petFee, petRent, rentersInsurance, adminFee, initialPayment, amountPaid, remainingBalance } = validationResult.data

    // Create the application in the database
    const application = await prisma.application.create({
      data: {
        userId,
        status: status || ['New'],
        createdAt,
        moveInDate,
        unitId,
        applicant: name, // Map 'name' to 'applicant' field
        email,
        phone,
        deposit: deposit || null,
        rent: rent || null,
        petFee: petFee || null,
        petRent: petRent || null,
        rentersInsurance: rentersInsurance || null,
        adminFee: adminFee || null,
        initialPayment: initialPayment || null,
        amountPaid: amountPaid || null,
        remainingBalance: remainingBalance || null,
        tasks: {
          create: tasks.map((task, index) => ({
            id: task.id,
            description: task.description,
            completed: task.completed,
            type: task.type || 'APPLICANT', // Use task type if provided, default to APPLICANT
            order: index // Set order based on array position
          }))
        }
      },
      include: {
        tasks: true,
        unit: {
          include: {
            property: true
          }
        }
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

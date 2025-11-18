import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'

// Create new service
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      title,
      slug,
      description,
      category,
      duration,
      price,
      maxAttendees,
      image,
      active = true
    } = body

    // Validate required fields
    if (!title || !slug || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, description, category' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingService = await prisma.service.findUnique({
      where: { slug }
    })

    if (existingService) {
      return NextResponse.json(
        { error: 'A service with this slug already exists' },
        { status: 409 }
      )
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        title,
        slug,
        description,
        category,
        duration,
        price: price ? parseFloat(price) : null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        image,
        active
      }
    })

    return NextResponse.json({
      message: 'Service created successfully',
      service
    })
  } catch (error) {
    console.error('Create service error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

// Get all services (including inactive ones for admin)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const services = await prisma.service.findMany({
      where: includeInactive ? undefined : { active: true },
      include: {
        schedules: {
          orderBy: { date: 'asc' }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Get services error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'

// Get single service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        schedules: {
          orderBy: { date: 'asc' }
        },
        registrations: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Get service error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// Update service
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
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
      active
    } = body

    // Check if slug is being changed and if it already exists
    if (slug) {
      const existingService = await prisma.service.findFirst({
        where: {
          slug,
          NOT: { id }
        }
      })

      if (existingService) {
        return NextResponse.json(
          { error: 'A service with this slug already exists' },
          { status: 409 }
        )
      }
    }

    // Build update data object
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (duration !== undefined) updateData.duration = duration
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null
    if (maxAttendees !== undefined) updateData.maxAttendees = maxAttendees ? parseInt(maxAttendees) : null
    if (image !== undefined) updateData.image = image
    if (active !== undefined) updateData.active = active

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      message: 'Service updated successfully',
      service
    })
  } catch (error) {
    console.error('Update service error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await prisma.service.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Service deleted successfully'
    })
  } catch (error) {
    console.error('Delete service error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}

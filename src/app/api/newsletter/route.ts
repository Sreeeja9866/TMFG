import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.newsletter.findUnique({
      where: { email }
    })

    if (existing) {
      if (existing.active) {
        return NextResponse.json(
          { message: 'Email already subscribed' },
          { status: 200 }
        )
      } else {
        // Reactivate subscription
        await prisma.newsletter.update({
          where: { email },
          data: { active: true }
        })
        return NextResponse.json(
          { message: 'Subscription reactivated successfully' },
          { status: 200 }
        )
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletter.create({
      data: {
        email,
        active: true
      }
    })

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter', subscription },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Deactivate subscription instead of deleting
    await prisma.newsletter.update({
      where: { email },
      data: { active: false }
    })

    return NextResponse.json(
      { message: 'Successfully unsubscribed from newsletter' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    )
  }
}

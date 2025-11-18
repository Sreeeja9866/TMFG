import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, getVolunteerWelcomeEmail } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, availability, interests, experience, message } = body

    // Validate required fields
    if (!name || !email || !availability) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create volunteer record
    const volunteer = await prisma.volunteer.create({
      data: {
        name,
        email,
        phone: phone || null,
        availability,
        interests: interests || [],
        experience: experience || null,
        message: message || null,
        status: 'pending',
      },
    })

    // Send welcome email
    const emailContent = getVolunteerWelcomeEmail(name)
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    })

    // Notify admin
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: 'New Volunteer Registration',
        text: `New volunteer registered:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nAvailability: ${availability}\nInterests: ${interests.join(', ')}\nExperience: ${experience || 'N/A'}\nMessage: ${message || 'N/A'}`,
        html: `
          <h2>New Volunteer Registration</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Availability:</strong> ${availability}</p>
          <p><strong>Interests:</strong> ${interests.join(', ')}</p>
          <p><strong>Experience:</strong> ${experience || 'N/A'}</p>
          <p><strong>Message:</strong> ${message || 'N/A'}</p>
        `,
      })
    }

    return NextResponse.json(
      { message: 'Volunteer registration successful', volunteer },
      { status: 201 }
    )
  } catch (error) {
    console.error('Volunteer registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register volunteer' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const id = searchParams.get('id')

    // If ID is provided, return single volunteer
    if (id) {
      const volunteer = await prisma.volunteer.findUnique({
        where: { id },
      })

      if (!volunteer) {
        return NextResponse.json(
          { error: 'Volunteer not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(volunteer, { status: 200 })
    }

    // Otherwise return list with optional status filter
    const volunteers = await prisma.volunteer.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ volunteers }, { status: 200 })
  } catch (error) {
    console.error('Error fetching volunteers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch volunteers' },
      { status: 500 }
    )
  }
}

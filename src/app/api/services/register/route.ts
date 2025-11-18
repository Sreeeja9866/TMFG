import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendRegistrationConfirmation } from '@/lib/email'
import { sendRegistrationSMS, isValidPhoneNumber } from '@/lib/sms-getotp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, scheduleId, message, serviceId, serviceSlug } = body

    // Validate required fields
    if (!name || !email || !serviceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // If scheduleId is provided, verify it exists and belongs to this service
    if (scheduleId) {
      const schedule = await prisma.schedule.findFirst({
        where: {
          id: scheduleId,
          serviceId: serviceId
        }
      })

      if (!schedule) {
        return NextResponse.json(
          { error: 'Schedule not found' },
          { status: 404 }
        )
      }

      // Check if there are available spots
      if (schedule.availableSpots <= 0) {
        return NextResponse.json(
          { error: 'No available spots for this schedule' },
          { status: 400 }
        )
      }
    }

    // Create registration record
    const registration = await prisma.registration.create({
      data: {
        serviceId,
        scheduleId: scheduleId || null,
        name,
        email,
        phone: phone || null,
        message: message || null,
        status: 'pending',
      },
    })

    // If a schedule was selected, decrement available spots
    if (scheduleId) {
      await prisma.schedule.update({
        where: { id: scheduleId },
        data: {
          availableSpots: {
            decrement: 1
          }
        }
      })
    }

    // Send confirmation email and SMS
    try {
      // Get schedule details if provided
      let scheduleDate = undefined
      let scheduleTime = undefined

      if (scheduleId) {
        const schedule = await prisma.schedule.findUnique({
          where: { id: scheduleId }
        })

        if (schedule) {
          scheduleDate = schedule.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          scheduleTime = `${schedule.startTime} - ${schedule.endTime}`
        }
      }

      // Send confirmation email to registrant
      await sendRegistrationConfirmation(
        email,
        name,
        service.title,
        scheduleDate,
        scheduleTime
      )

      console.log('Registration confirmation email sent to:', email)

      // Send SMS confirmation if phone number is provided and valid
      if (phone && isValidPhoneNumber(phone)) {
        await sendRegistrationSMS(
          phone,
          name,
          service.title,
          scheduleDate,
          scheduleTime
        )
        console.log('Registration confirmation SMS sent to:', phone)
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError)
      // Don't fail the registration if email/SMS fails
    }

    return NextResponse.json(
      { message: 'Registration successful', registration },
      { status: 201 }
    )
  } catch (error) {
    console.error('Workshop registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register for workshop' },
      { status: 500 }
    )
  }
}

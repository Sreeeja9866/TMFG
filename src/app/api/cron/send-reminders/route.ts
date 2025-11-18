import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEventReminder } from '@/lib/email'
import { sendEventReminderSMS, isValidPhoneNumber } from '@/lib/sms-getotp'

// This route should be called by a cron job to send reminders
// For Vercel, you can use Vercel Cron Jobs
// For other platforms, use a service like cron-job.org or your server's cron

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job (simple auth)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get tomorrow's date range
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    // Find all schedules for tomorrow
    const schedulesForTomorrow = await prisma.schedule.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        }
      },
      include: {
        service: true,
        registrations: {
          where: {
            status: 'confirmed' // Only send reminders to confirmed registrations
          }
        }
      }
    })

    let emailsSent = 0
    let emailsFailed = 0
    let smsSent = 0
    let smsFailed = 0

    // Send reminder emails and SMS
    for (const schedule of schedulesForTomorrow) {
      for (const registration of schedule.registrations) {
        const scheduleDate = schedule.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        const scheduleTime = `${schedule.startTime} - ${schedule.endTime}`

        // Send email reminder
        try {
          await sendEventReminder(
            registration.email,
            registration.name,
            schedule.service.title,
            scheduleDate,
            scheduleTime
          )

          emailsSent++
          console.log(`Email reminder sent to ${registration.email} for ${schedule.service.title}`)
        } catch (error) {
          console.error(`Failed to send email reminder to ${registration.email}:`, error)
          emailsFailed++
        }

        // Send SMS reminder if phone number is available and valid
        if (registration.phone && isValidPhoneNumber(registration.phone)) {
          try {
            await sendEventReminderSMS(
              registration.phone,
              registration.name,
              schedule.service.title,
              scheduleDate,
              scheduleTime
            )

            smsSent++
            console.log(`SMS reminder sent to ${registration.phone} for ${schedule.service.title}`)
          } catch (error) {
            console.error(`Failed to send SMS reminder to ${registration.phone}:`, error)
            smsFailed++
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Reminder job completed',
      stats: {
        schedulesFound: schedulesForTomorrow.length,
        emailsSent,
        emailsFailed,
        smsSent,
        smsFailed
      }
    })
  } catch (error) {
    console.error('Reminder cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    )
  }
}

// Auto-confirm pending registrations (optional - can be called separately)
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Auto-confirm registrations that are older than 1 hour and still pending
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const result = await prisma.registration.updateMany({
      where: {
        status: 'pending',
        createdAt: {
          lt: oneHourAgo
        }
      },
      data: {
        status: 'confirmed'
      }
    })

    return NextResponse.json({
      message: 'Auto-confirmation completed',
      confirmed: result.count
    })
  } catch (error) {
    console.error('Auto-confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-confirm registrations' },
      { status: 500 }
    )
  }
}

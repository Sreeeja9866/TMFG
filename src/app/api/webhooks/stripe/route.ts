import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendEmail, getDonationThankYouEmail } from '@/lib/notifications'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      try {
        // Create donation record
        const donation = await prisma.donation.create({
          data: {
            amount: (session.amount_total || 0) / 100, // Convert from cents
            currency: session.currency || 'usd',
            donorName: session.metadata?.donorName || 'Anonymous',
            donorEmail: session.customer_email || session.metadata?.donorEmail || '',
            stripePaymentId: session.payment_intent as string,
            status: 'succeeded',
            message: session.metadata?.message || null,
          },
        })

        // Send thank you email
        if (session.customer_email) {
          const emailContent = getDonationThankYouEmail(
            session.metadata?.donorName || 'Friend',
            donation.amount
          )
          await sendEmail({
            to: session.customer_email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
          })
        }

        // Notify admin
        if (process.env.ADMIN_EMAIL) {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: 'New Donation Received',
            text: `New donation:\n\nAmount: $${donation.amount}\nDonor: ${donation.donorName}\nEmail: ${donation.donorEmail}\nMessage: ${donation.message || 'N/A'}`,
          })
        }

        console.log('Donation recorded:', donation.id)
      } catch (error) {
        console.error('Error processing donation:', error)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed:', paymentIntent.id)

      // You could create a failed donation record here if needed
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

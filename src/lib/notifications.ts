import sgMail from '@sendgrid/mail'
import twilio from 'twilio'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    console.error('SendGrid credentials not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text,
      html: html || text,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

interface SMSOptions {
  to: string
  message: string
}

export async function sendSMS({ to, message }: SMSOptions) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('Twilio credentials not configured')
    return { success: false, error: 'SMS service not configured' }
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return { success: false, error }
  }
}

// Template functions
export function getVolunteerWelcomeEmail(name: string) {
  return {
    subject: 'Welcome to The Morning Family Garden!',
    text: `Hi ${name},\n\nThank you for signing up to volunteer with The Morning Family Garden! We're excited to have you join our community.\n\nWe'll be in touch soon with more information about upcoming volunteer opportunities.\n\nBest regards,\nThe Morning Family Garden Team`,
    html: `
      <h2>Welcome to The Morning Family Garden!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for signing up to volunteer with The Morning Family Garden! We're excited to have you join our community.</p>
      <p>We'll be in touch soon with more information about upcoming volunteer opportunities.</p>
      <p>Best regards,<br>The Morning Family Garden Team</p>
    `,
  }
}

export function getWorkshopRegistrationEmail(name: string, serviceName: string, date?: string) {
  const dateInfo = date ? ` scheduled for ${date}` : ''
  return {
    subject: `Workshop Registration Confirmed: ${serviceName}`,
    text: `Hi ${name},\n\nYour registration for "${serviceName}"${dateInfo} has been confirmed!\n\nWe look forward to seeing you.\n\nBest regards,\nThe Morning Family Garden Team`,
    html: `
      <h2>Workshop Registration Confirmed</h2>
      <p>Hi ${name},</p>
      <p>Your registration for <strong>"${serviceName}"</strong>${dateInfo} has been confirmed!</p>
      <p>We look forward to seeing you.</p>
      <p>Best regards,<br>The Morning Family Garden Team</p>
    `,
  }
}

export function getDonationThankYouEmail(name: string, amount: number) {
  return {
    subject: 'Thank You for Your Donation!',
    text: `Hi ${name},\n\nThank you for your generous donation of $${amount.toFixed(2)} to The Morning Family Garden!\n\nYour support helps us maintain our community gardens, provide free workshops, and promote sustainable agriculture in our neighborhood.\n\nBest regards,\nThe Morning Family Garden Team`,
    html: `
      <h2>Thank You for Your Donation!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your generous donation of <strong>$${amount.toFixed(2)}</strong> to The Morning Family Garden!</p>
      <p>Your support helps us maintain our community gardens, provide free workshops, and promote sustainable agriculture in our neighborhood.</p>
      <p>Best regards,<br>The Morning Family Garden Team</p>
    `,
  }
}

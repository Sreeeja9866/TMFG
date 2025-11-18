// Email service for sending OTP and notifications
// Using nodemailer for development, can be replaced with SendGrid/Resend for production

import nodemailer from 'nodemailer'

// Create a transporter
const createTransporter = () => {
  // For development, use ethereal email or SMTP settings from .env
  if (process.env.EMAIL_SERVER_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_PORT === '465',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })
  }

  // Fallback: create test account for development
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.password',
    },
  })
}

export async function sendOTPEmail(email: string, otp: string) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@tmfg.org',
      to: email,
      subject: 'Your Admin Verification Code - TMFG',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
              }
              .container {
                background: linear-gradient(135deg, #2D5016 0%, #6B8E23 100%);
                padding: 40px 20px;
                border-radius: 10px;
              }
              .content {
                background: white;
                padding: 30px;
                border-radius: 8px;
              }
              .otp-box {
                background: #f5f5f5;
                border: 2px dashed #2D5016;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
                border-radius: 8px;
              }
              .otp {
                font-size: 32px;
                font-weight: bold;
                color: #2D5016;
                letter-spacing: 8px;
              }
              .footer {
                text-align: center;
                color: white;
                margin-top: 20px;
                font-size: 14px;
              }
              .logo {
                text-align: center;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <h1 style="color: white; margin: 0;">🌱 TMFG</h1>
                <p style="color: white; margin: 5px 0;">The Morning Family Garden</p>
              </div>
              <div class="content">
                <h2 style="color: #2D5016;">Admin Verification Code</h2>
                <p>Hello,</p>
                <p>You have requested to sign up as an admin for The Morning Family Garden. Please use the verification code below to complete your registration:</p>

                <div class="otp-box">
                  <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
                  <p class="otp">${otp}</p>
                </div>

                <p><strong>This code will expire in 10 minutes.</strong></p>

                <p>If you didn't request this code, please ignore this email or contact us if you have concerns.</p>

                <p>Best regards,<br>The Morning Family Garden Team</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} The Morning Family Garden. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Your TMFG Admin Verification Code

        Hello,

        You have requested to sign up as an admin for The Morning Family Garden.

        Your verification code is: ${otp}

        This code will expire in 10 minutes.

        If you didn't request this code, please ignore this email.

        Best regards,
        The Morning Family Garden Team
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('OTP Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return { success: false, error }
  }
}

export async function sendRegistrationConfirmation(
  email: string,
  name: string,
  serviceName: string,
  scheduleDate?: string,
  scheduleTime?: string
) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@tmfg.org',
      to: email,
      subject: `Registration Confirmed: ${serviceName} - TMFG`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
              }
              .container {
                background: linear-gradient(135deg, #2D5016 0%, #6B8E23 100%);
                padding: 40px 20px;
                border-radius: 10px;
              }
              .content {
                background: white;
                padding: 30px;
                border-radius: 8px;
              }
              .event-details {
                background: #f5f5f5;
                padding: 20px;
                border-left: 4px solid #6B8E23;
                margin: 20px 0;
                border-radius: 4px;
              }
              .button {
                display: inline-block;
                background: #6B8E23;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: white;
                margin-top: 20px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2 style="color: #2D5016;">✅ Registration Confirmed!</h2>
                <p>Dear ${name},</p>
                <p>Thank you for registering for our workshop. We're excited to have you join us!</p>

                <div class="event-details">
                  <h3 style="margin-top: 0; color: #2D5016;">Event Details</h3>
                  <p><strong>Workshop:</strong> ${serviceName}</p>
                  ${scheduleDate ? `<p><strong>Date:</strong> ${scheduleDate}</p>` : ''}
                  ${scheduleTime ? `<p><strong>Time:</strong> ${scheduleTime}</p>` : ''}
                </div>

                <p>We'll send you a reminder 24 hours before the event.</p>

                <p>If you have any questions, please don't hesitate to contact us.</p>

                <p>See you soon!<br>The Morning Family Garden Team</p>
              </div>
              <div class="footer">
                <p>🌱 The Morning Family Garden</p>
                <p>© ${new Date().getFullYear()} All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Registration confirmation sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending registration confirmation:', error)
    return { success: false, error }
  }
}

export async function sendEventReminder(
  email: string,
  name: string,
  serviceName: string,
  scheduleDate: string,
  scheduleTime: string
) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@tmfg.org',
      to: email,
      subject: `Reminder: ${serviceName} Tomorrow - TMFG`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
              }
              .container {
                background: linear-gradient(135deg, #2D5016 0%, #6B8E23 100%);
                padding: 40px 20px;
                border-radius: 10px;
              }
              .content {
                background: white;
                padding: 30px;
                border-radius: 8px;
              }
              .reminder-box {
                background: #FFF3CD;
                border-left: 4px solid #FFC107;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                color: white;
                margin-top: 20px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2 style="color: #2D5016;">⏰ Event Reminder</h2>
                <p>Hi ${name},</p>
                <p>This is a friendly reminder that your workshop is coming up tomorrow!</p>

                <div class="reminder-box">
                  <h3 style="margin-top: 0; color: #856404;">Tomorrow's Event</h3>
                  <p><strong>Workshop:</strong> ${serviceName}</p>
                  <p><strong>Date:</strong> ${scheduleDate}</p>
                  <p><strong>Time:</strong> ${scheduleTime}</p>
                </div>

                <p><strong>What to bring:</strong></p>
                <ul>
                  <li>Comfortable clothes</li>
                  <li>Water bottle</li>
                  <li>Enthusiasm to learn!</li>
                </ul>

                <p>We look forward to seeing you tomorrow!</p>

                <p>Best regards,<br>The Morning Family Garden Team</p>
              </div>
              <div class="footer">
                <p>🌱 The Morning Family Garden</p>
                <p>© ${new Date().getFullYear()} All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Event reminder sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending event reminder:', error)
    return { success: false, error }
  }
}

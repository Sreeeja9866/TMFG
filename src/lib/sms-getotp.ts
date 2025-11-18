import axios from 'axios'

const getOTPApiKey = process.env.GETOTP_API_KEY
const getOTPAppId = process.env.GETOTP_APP_ID

/**
 * Send SMS OTP using GetOTP service
 */
export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<boolean> {
  if (!getOTPApiKey || !getOTPAppId) {
    console.error('GetOTP is not configured')
    // In development, log the OTP to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] SMS OTP for ${phoneNumber}: ${otp}`)
      return true
    }
    return false
  }

  try {
    const message = `Your TMFG verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\n- The Morning Family Garden`

    const response = await axios.post(
      'https://api.getotp.com/v1/send',
      {
        app_id: getOTPAppId,
        mobile: phoneNumber,
        message: message,
      },
      {
        headers: {
          'Authorization': `Bearer ${getOTPApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.success) {
      console.log(`SMS OTP sent to ${phoneNumber} via GetOTP`)
      return true
    } else {
      console.error('GetOTP error:', response.data.message)
      return false
    }
  } catch (error: any) {
    console.error('Error sending SMS OTP via GetOTP:', error.response?.data || error.message)
    return false
  }
}

/**
 * Send event registration confirmation via SMS
 */
export async function sendRegistrationSMS(
  phoneNumber: string,
  name: string,
  serviceName: string,
  scheduleDate?: string,
  scheduleTime?: string
): Promise<boolean> {
  if (!getOTPApiKey || !getOTPAppId) {
    console.error('GetOTP is not configured')
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] Registration SMS for ${phoneNumber}`)
      return true
    }
    return false
  }

  try {
    let messageBody = `Hi ${name}!\n\nYou're registered for: ${serviceName}`

    if (scheduleDate && scheduleTime) {
      messageBody += `\n\nDate: ${scheduleDate}\nTime: ${scheduleTime}`
    }

    messageBody += `\n\nThank you for joining us!\n- The Morning Family Garden`

    const response = await axios.post(
      'https://api.getotp.com/v1/send',
      {
        app_id: getOTPAppId,
        mobile: phoneNumber,
        message: messageBody,
      },
      {
        headers: {
          'Authorization': `Bearer ${getOTPApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.success) {
      console.log(`Registration SMS sent to ${phoneNumber} via GetOTP`)
      return true
    } else {
      console.error('GetOTP error:', response.data.message)
      return false
    }
  } catch (error: any) {
    console.error('Error sending registration SMS:', error.response?.data || error.message)
    return false
  }
}

/**
 * Send event reminder via SMS (24 hours before)
 */
export async function sendEventReminderSMS(
  phoneNumber: string,
  name: string,
  serviceName: string,
  scheduleDate: string,
  scheduleTime: string
): Promise<boolean> {
  if (!getOTPApiKey || !getOTPAppId) {
    console.error('GetOTP is not configured')
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] Reminder SMS for ${phoneNumber}`)
      return true
    }
    return false
  }

  try {
    const messageBody = `Hi ${name}!\n\nReminder: ${serviceName} is tomorrow!\n\nDate: ${scheduleDate}\nTime: ${scheduleTime}\n\nSee you there!\n- The Morning Family Garden`

    const response = await axios.post(
      'https://api.getotp.com/v1/send',
      {
        app_id: getOTPAppId,
        mobile: phoneNumber,
        message: messageBody,
      },
      {
        headers: {
          'Authorization': `Bearer ${getOTPApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.success) {
      console.log(`Reminder SMS sent to ${phoneNumber} via GetOTP`)
      return true
    } else {
      console.error('GetOTP error:', response.data.message)
      return false
    }
  } catch (error: any) {
    console.error('Error sending reminder SMS:', error.response?.data || error.message)
    return false
  }
}

/**
 * Validate phone number format (E.164)
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic E.164 format validation: +[country code][number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  return phoneRegex.test(phoneNumber)
}

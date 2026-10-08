import crypto from 'crypto'

const SECRET = process.env.UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || 'wisewayround-unsubscribe-2024'

/**
 * Generate a signed unsubscribe token for an email address.
 * This prevents people from unsubscribing others by guessing URLs.
 */
export function generateUnsubscribeToken(email: string): string {
  const hmac = crypto.createHmac('sha256', SECRET)
  hmac.update(email.toLowerCase().trim())
  return hmac.digest('hex').slice(0, 32)
}

/**
 * Verify an unsubscribe token matches the email.
 */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!token || token.length < 32) return false
  const expected = generateUnsubscribeToken(email)
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token.slice(0, 32)))
  } catch {
    return false
  }
}

/**
 * Generate the full unsubscribe URL for a given email.
 */
export function getUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email)
  const encoded = encodeURIComponent(email.toLowerCase().trim())
  return `https://wisewayround.co.uk/unsubscribe?email=${encoded}&token=${token}`
}

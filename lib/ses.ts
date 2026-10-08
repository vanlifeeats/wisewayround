/**
 * Amazon SES email sender for Wise Way Round.
 * Replaces Resend for all email sending.
 * 
 * Sends via SES in eu-west-2 (London).
 * Supports single sends and batch sends (max 14/second).
 */

import { SESClient, SendEmailCommand, SendEmailCommandInput, SendRawEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || 'eu-west-2',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || '',
  },
})

export interface EmailParams {
  from: string
  to: string
  subject: string
  html: string
  replyTo?: string
  headers?: Record<string, string>
}

/**
 * Send a single email via SES.
 * Uses SendRawEmailCommand when custom headers (e.g. List-Unsubscribe) are present.
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // If custom headers are provided, use raw email to include them
    if (params.headers && Object.keys(params.headers).length > 0) {
      const boundary = `----=_Part_${Date.now()}`
      const replyTo = params.replyTo || 'hello@wisewayround.co.uk'

      const headerLines = [
        `From: ${params.from}`,
        `To: ${params.to}`,
        `Subject: =?UTF-8?B?${Buffer.from(params.subject).toString('base64')}?=`,
        `Reply-To: ${replyTo}`,
        `MIME-Version: 1.0`,
        ...Object.entries(params.headers).map(([k, v]) => `${k}: ${v}`),
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        `Content-Type: text/html; charset=UTF-8`,
        `Content-Transfer-Encoding: 7bit`,
        '',
        params.html,
        '',
        `--${boundary}--`,
      ]

      const rawMessage = headerLines.join('\r\n')

      await ses.send(new SendRawEmailCommand({
        RawMessage: { Data: new TextEncoder().encode(rawMessage) },
      }))
      return true
    }

    // Standard send (no custom headers needed)
    const input: SendEmailCommandInput = {
      Source: params.from,
      Destination: { ToAddresses: [params.to] },
      Message: {
        Subject: { Data: params.subject, Charset: 'UTF-8' },
        Body: { Html: { Data: params.html, Charset: 'UTF-8' } },
      },
      ReplyToAddresses: params.replyTo ? [params.replyTo] : ['hello@wisewayround.co.uk'],
    }

    await ses.send(new SendEmailCommand(input))
    return true
  } catch (error: any) {
    console.error('SES send error:', error.message || error)
    return false
  }
}

export interface EmailSendResult {
  to: string
  success: boolean
  error?: string
}

export interface BatchSendSummary {
  sent: number
  failed: number
  total: number
  results: EmailSendResult[]
  failedRecipients: EmailSendResult[]
}

/**
 * Send a single email via SES, returning the outcome instead of throwing/swallowing it.
 * Kept internal to this module — sendEmail() above stays the public boolean-returning API
 * for existing single-send callers.
 */
async function sendEmailWithResult(params: EmailParams): Promise<EmailSendResult> {
  try {
    const ok = await sendEmail(params)
    return ok
      ? { to: params.to, success: true }
      : { to: params.to, success: false, error: 'SES send returned failure (see server logs for details)' }
  } catch (error: any) {
    return { to: params.to, success: false, error: error?.message || String(error) }
  }
}

/**
 * Send a batch of emails via SES.
 * Respects the 14/second rate limit with small delays.
 * Returns a full breakdown — not just a count — so failed recipients can be identified
 * and retried later instead of silently disappearing into server logs.
 */
export async function sendBatchEmails(emails: EmailParams[]): Promise<BatchSendSummary> {
  const BATCH_SIZE = 12 // Stay under 14/sec limit
  const DELAY_MS = 1100 // Just over 1 second between batches
  const results: EmailSendResult[] = []

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE)

    // Send batch in parallel
    const settled = await Promise.allSettled(
      batch.map(email => sendEmailWithResult(email))
    )

    settled.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        results.push(r.value)
      } else {
        // Promise.allSettled rejection — sendEmailWithResult itself shouldn't throw,
        // but guard against it so one bad recipient never drops silently.
        results.push({ to: batch[idx].to, success: false, error: r.reason?.message || String(r.reason) })
      }
    })

    // Delay between batches to respect rate limit
    if (i + BATCH_SIZE < emails.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }

  const failedRecipients = results.filter(r => !r.success)

  return {
    sent: results.length - failedRecipients.length,
    failed: failedRecipients.length,
    total: results.length,
    results,
    failedRecipients,
  }
}

/**
 * Helper: build email params with standard Wise Way Round defaults.
 */
export function buildEmail(opts: {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}): EmailParams {
  return {
    from: opts.from || 'Wise Way Round <hello@wisewayround.co.uk>',
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo || 'hello@wisewayround.co.uk',
  }
}

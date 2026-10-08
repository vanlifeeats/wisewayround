// Branded email shell — wraps content in the Wise Way Round look
// Used by system emails (password reset, welcome, event reminders)

import { getUnsubscribeUrl } from './unsubscribe'

// TODO: replace with real Wise Way Round logo/photo asset
const LOGO_URL = 'https://wisewayround.co.uk/og-image.jpg'
// TODO: replace with real Wise Way Round logo/photo asset
const MARK_PHOTO_URL = 'https://wisewayround.co.uk/og-image.jpg'

export function emailShell(opts: {
  preheader?: string
  heroEmoji?: string
  heading: string
  subheading?: string
  body: string
  ctaText?: string
  ctaUrl?: string
  footerNote?: string
  from?: 'basil' | 'mark'
  recipientEmail?: string
}) {
  const { preheader = '', heroEmoji = '🌿', heading, subheading = '', body, ctaText, ctaUrl, footerNote = '', from = 'mark', recipientEmail } = opts

  const signoffName = from === 'mark' ? 'Zoe & Mark' : 'Basil'
  const signoffSub = from === 'mark' ? 'Wise Way Round' : 'Vanlife Eats Kitchen'
  const signoffImg = from === 'mark'
    ? `<img src="${MARK_PHOTO_URL}" alt="Chef Mark" width="44" height="44" style="border-radius:50%;display:block" />`
    : `<div style="width:44px;height:44px;border-radius:50%;background:#3a8a3a;display:flex;align-items:center;justify-content:center;font-size:22px;line-height:44px;text-align:center">🌿</div>`

  const unsubscribeLink = recipientEmail
    ? `<a href="${getUnsubscribeUrl(recipientEmail)}" style="color:#bbb;text-decoration:underline">Unsubscribe</a>`
    : `<a href="https://wisewayround.co.uk/unsubscribe" style="color:#bbb;text-decoration:underline">Unsubscribe</a>`

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#F8F4EE;margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">${preheader}</div>
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <!-- Header with logo -->
    <div style="background:#111;padding:28px 32px;text-align:center">
      <img src="${LOGO_URL}" alt="Wise Way Round" width="160" style="display:inline-block;max-width:160px;height:auto" />
      ${heroEmoji ? `<div style="font-size:36px;margin-top:12px">${heroEmoji}</div>` : ''}
    </div>
    <!-- Body -->
    <div style="padding:36px 32px">
      <h1 style="font-size:24px;color:#111;margin:0 0 ${subheading ? '6px' : '20px'};font-family:Georgia,serif;line-height:1.2">${heading}</h1>
      ${subheading ? `<p style="font-size:15px;color:#888;margin:0 0 24px">${subheading}</p>` : ''}
      <div style="font-size:15px;color:#444;line-height:1.8">${body}</div>
      ${ctaText && ctaUrl ? `<div style="text-align:center;margin:28px 0 8px"><a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;background:#F07820;color:#fff;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px">${ctaText}</a></div>` : ''}
      ${footerNote ? `<p style="font-size:13px;color:#999;line-height:1.7;margin-top:24px">${footerNote}</p>` : ''}
      <!-- Sign-off -->
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0ebe3">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding-right:12px;vertical-align:middle">
            ${signoffImg}
          </td>
          <td style="vertical-align:middle">
            <div style="font-size:14px;font-weight:700;color:#111">${signoffName}</div>
            <div style="font-size:12px;color:#aaa">${signoffSub}</div>
          </td>
        </tr></table>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:14px 32px;text-align:center;font-size:11px;color:#bbb;background:#fafafa">
      Wise Way Round · <a href="https://wisewayround.co.uk" style="color:#F07820;text-decoration:none">wisewayround.co.uk</a>
      · ${unsubscribeLink}
    </div>
  </div>
</body></html>`
}

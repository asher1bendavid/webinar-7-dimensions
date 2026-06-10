import fs from 'fs'
import path from 'path'
import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY!
const EMAIL_FROM     = process.env.EMAIL_FROM ?? 'Paretix Academy <noreply@paretix.com>'

const BASE_URL   = 'https://paretix-ai-assessment.vercel.app'
const LOGO_URL   = `${BASE_URL}/images/logo-light.png`
const COURSE_URL = 'https://academy.paretix.com/'
const WEBINAR_URL = 'https://7dimentionswebinar.paretix.com'
const IMG        = `${BASE_URL}/images/email`

const FONT_EN = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const FONT_HE = "'Heebo', 'Noto Sans Hebrew', 'Helvetica Neue', Arial, sans-serif"

// ─── BANNERS ──────────────────────────────────────────────────────────────────

function courseBanner(isRTL: boolean): string {
  const font    = isRTL ? FONT_HE : FONT_EN
  const lang    = isRTL ? 'he' : 'en'
  const imgSrc  = `${IMG}/course-v1-${lang}.png`
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
  <tr>
    <td style="border-radius:12px;overflow:hidden;">
      <a href="${COURSE_URL}" style="display:block;line-height:0;font-size:0;">
        <img src="${imgSrc}" width="580" alt="${isRTL ? 'שלוט ב-7 ממדי ה-AI — להרשמה לקורס' : 'Master the 7 AI Dimensions — Enroll Now'}"
          style="display:block;width:100%;max-width:580px;border:0;border-radius:12px;" />
      </a>
      <!--[if !mso]><!-->
      <div style="display:none;max-height:0;overflow:hidden;">
      <!--<![endif]-->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#030d2e;border-radius:12px;border:1px solid rgba(197,160,89,0.3);">
          <tr>
            <td style="padding:20px 24px;" ${isRTL ? 'dir="rtl"' : ''}>
              <p style="margin:0 0 4px;font-family:${font};font-size:10px;font-weight:700;
                        letter-spacing:0.12em;text-transform:uppercase;color:#8892a4;">
                ${isRTL ? 'קורס מקצועי' : 'PROFESSIONAL COURSE'}
              </p>
              <p style="margin:0 0 12px;font-family:${font};font-size:16px;font-weight:700;color:#ffffff;">
                ${isRTL ? 'שלוט ב-7 ממדי ה-AI' : 'Master the 7 AI Dimensions'}
              </p>
              <a href="${COURSE_URL}"
                style="display:inline-block;background:#ffffff;color:#06183d;font-family:${font};
                       font-size:13px;font-weight:800;padding:10px 20px;border-radius:8px;text-decoration:none;">
                ${isRTL ? 'להרשמה לקורס ←' : 'ENROLL NOW →'}
              </a>
            </td>
          </tr>
        </table>
      <!--[if !mso]><!-->
      </div>
      <!--<![endif]-->
    </td>
  </tr>
</table>`
}

function webinarBanner(isRTL: boolean): string {
  const font   = isRTL ? FONT_HE : FONT_EN
  const lang   = isRTL ? 'he' : 'en'
  const imgSrc = `${IMG}/webinar-v1-${lang}.png`
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:0;">
  <tr>
    <td style="border-radius:12px;overflow:hidden;">
      <a href="${WEBINAR_URL}" style="display:block;line-height:0;font-size:0;">
        <img src="${imgSrc}" width="580" alt="${isRTL ? '7 ממדי ה-AI — וובינר חינם' : 'The 7 AI Dimensions — Free Webinar'}"
          style="display:block;width:100%;max-width:580px;border:0;border-radius:12px;" />
      </a>
      <!--[if !mso]><!-->
      <div style="display:none;max-height:0;overflow:hidden;">
      <!--<![endif]-->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#020c28;border-radius:12px;border:1px solid rgba(31,211,255,0.2);">
          <tr>
            <td style="padding:20px 24px;" ${isRTL ? 'dir="rtl"' : ''}>
              <p style="margin:8px 0 12px;font-family:${font};font-size:16px;font-weight:700;color:#ffffff;">
                ${isRTL ? '7 ממדי ה-AI שכל אנליסט חייב לדעת' : 'The 7 AI dimensions every analyst must know'}
              </p>
              <a href="${WEBINAR_URL}"
                style="display:inline-block;background:#ffffff;color:#06183d;font-family:${font};
                       font-size:13px;font-weight:800;padding:10px 20px;border-radius:8px;text-decoration:none;">
                ${isRTL ? 'להרשמה חינם ←' : 'REGISTER FREE →'}
              </a>
            </td>
          </tr>
        </table>
      <!--[if !mso]><!-->
      </div>
      <!--<![endif]-->
    </td>
  </tr>
</table>`
}

// ─── ICS CALENDAR INVITE ──────────────────────────────────────────────────────

export function generateICS(): string {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const organizer = EMAIL_FROM.match(/<(.+)>/)?.[1] ?? 'noreply@paretix.com'
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PARETIX Ltd//Webinar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    'DTSTART:20260618T150000Z',
    'DTEND:20260618T160000Z',
    `DTSTAMP:${dtstamp}`,
    `ORGANIZER;CN=Paretix Academy:mailto:${organizer}`,
    'UID:webinar-7ai-dimensions-20260618@paretix.com',
    'SUMMARY:7 AI Dimensions Webinar - Paretix Academy',
    'DESCRIPTION:7 ממדי ה-AI שכל אנליסט ומנהל חייב לשלוט בהם.\\nThe 7 AI Dimensions every analyst and manager must master.\\n\\nJoin link will be sent to your email before the event.',
    `URL:${WEBINAR_URL}`,
    'LOCATION:Online - Join link will be sent via email',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Webinar starts in 1 hour - check your email for the join link',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Webinar starts in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

// ─── PDF LOADER ───────────────────────────────────────────────────────────────

function loadPDF(): Buffer | null {
  // Drop your PDF at public/webinar-guide.pdf — it auto-attaches
  try {
    const p = path.join(process.cwd(), 'public', 'webinar-guide.pdf')
    if (fs.existsSync(p)) return fs.readFileSync(p)
  } catch { /* no PDF — skip */ }
  return null
}

// ─── EMAIL TEMPLATE ───────────────────────────────────────────────────────────

function buildEmail(name: string, isRTL: boolean): string {
  const font = isRTL ? FONT_HE : FONT_EN
  const dir  = isRTL ? 'rtl' : 'ltr'

  const details = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:20px 0;background:rgba(197,160,89,0.07);
                  border:1px solid rgba(197,160,89,0.25);border-radius:10px;">
      <tr>
        <td style="padding:14px 18px;" dir="${dir}">
          <p style="margin:0 0 6px;font-family:${font};font-size:14px;color:#ccd6f6;">
            📅&nbsp; ${isRTL ? 'יום חמישי, 18 יוני 2026' : 'Thursday, June 18, 2026'}
          </p>
          <p style="margin:0 0 6px;font-family:${font};font-size:14px;color:#ccd6f6;">
            🕕&nbsp; 18:00 GMT+3 &nbsp;·&nbsp; ${isRTL ? '60 דקות' : '60 Minutes'}
          </p>
          <p style="margin:0;font-family:${font};font-size:14px;color:#ccd6f6;">
            🌐&nbsp; ${isRTL ? 'שידור חי בעברית' : 'Live stream in Hebrew'}
          </p>
        </td>
      </tr>
    </table>`

  const card = isRTL ? `
    <td style="background:#0a192f;border-radius:16px;border:1px solid rgba(197,160,89,0.2);
               padding:36px 32px;" dir="rtl">
      <p style="margin:0 0 4px;font-family:${font};font-size:11px;font-weight:700;
                letter-spacing:0.1em;text-transform:uppercase;color:#c5a059;">Paretix Academy</p>
      <h1 style="margin:0 0 10px;font-family:${font};font-size:22px;font-weight:800;
                 color:#ffffff;line-height:1.3;">${name}, נרשמת לוובינר!</h1>
      <p style="margin:0 0 4px;font-family:${font};font-size:15px;color:#8892a4;line-height:1.6;">
        נרשמת בהצלחה לוובינר
        <strong style="color:#ccd6f6;">7 ממדי ה-AI שכל אנליסט ומנהל חייב לשלוט בהם.</strong>
      </p>
      ${details}
      <p style="margin:0 0 8px;font-family:${font};font-size:14px;color:#8892a4;line-height:1.6;">
        קישור הצטרפות לשידור החי יישלח לכתובת מייל זו לפני הוובינר.
      </p>
      <p style="margin:0 0 24px;font-family:${font};font-size:13px;color:#6b7280;line-height:1.5;">
        📎 הזמנת יומן מצורפת לאימייל זה. פתח אותה כדי להוסיף את האירוע ליומן שלך.
      </p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 0 0;">
        <tr>
          <td align="center" bgcolor="#c5a059" style="border-radius:10px;">
            <a href="${WEBINAR_URL}"
               style="display:inline-block;padding:13px 32px;color:#0a192f;font-family:${font};
                      font-size:15px;font-weight:800;text-decoration:none;
                      border-radius:10px;white-space:nowrap;">לדף הוובינר ←</a>
          </td>
        </tr>
      </table>
    </td>` : `
    <td style="background:#0a192f;border-radius:16px;border:1px solid rgba(197,160,89,0.2);
               padding:36px 32px;">
      <p style="margin:0 0 4px;font-family:${font};font-size:11px;font-weight:700;
                letter-spacing:0.1em;text-transform:uppercase;color:#c5a059;">Paretix Academy</p>
      <h1 style="margin:0 0 10px;font-family:${font};font-size:22px;font-weight:800;
                 color:#ffffff;line-height:1.3;">${name}, you're registered!</h1>
      <p style="margin:0 0 4px;font-family:${font};font-size:15px;color:#8892a4;line-height:1.6;">
        You've successfully registered for the webinar
        <strong style="color:#ccd6f6;">7 AI Dimensions Every Analyst and Manager Must Master.</strong>
      </p>
      ${details}
      <p style="margin:0 0 8px;font-family:${font};font-size:14px;color:#8892a4;line-height:1.6;">
        Your live stream join link will be sent to this email address before the webinar.
      </p>
      <p style="margin:0 0 24px;font-family:${font};font-size:13px;color:#6b7280;line-height:1.5;">
        📎 A calendar invite is attached to this email. Open it to add the event to your calendar.
      </p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" bgcolor="#c5a059" style="border-radius:10px;">
            <a href="${WEBINAR_URL}"
               style="display:inline-block;padding:13px 32px;color:#0a192f;font-family:${font};
                      font-size:15px;font-weight:800;text-decoration:none;
                      border-radius:10px;white-space:nowrap;">View Webinar Page →</a>
          </td>
        </tr>
      </table>
    </td>`

  return `<!DOCTYPE html>
<html lang="${isRTL ? 'he' : 'en'}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Paretix Academy</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800;900&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f5f7;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">
        <tr>
          <td align="center" style="padding:0 0 20px 0;">
            <img src="${LOGO_URL}" alt="Paretix Academy" width="160" height="auto"
              style="display:block;border:0;height:auto;" />
          </td>
        </tr>
        <tr>${card}</tr>
        <tr><td style="padding:12px 0 0 0;">${webinarBanner(isRTL)}</td></tr>
        <tr><td style="padding:12px 0 0 0;">${courseBanner(isRTL)}</td></tr>
        <tr>
          <td align="center" style="padding:24px 0 0 0;">
            <p style="margin:0;font-family:${font};font-size:11px;color:#9ca3af;line-height:1.8;">
              © 2026 PARETIX Ltd. · 31 Yavne Street, Tel-Aviv, Israel<br/>
              <a href="${WEBINAR_URL}/privacy" style="color:#9ca3af;text-decoration:underline;">Privacy Policy</a>
              &nbsp;·&nbsp;
              <a href="${WEBINAR_URL}/terms" style="color:#9ca3af;text-decoration:underline;">Terms of Use</a>
              &nbsp;·&nbsp;
              <a href="${COURSE_URL}" style="color:#c5a059;text-decoration:none;">Paretix Academy</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

// ─── SEND ─────────────────────────────────────────────────────────────────────

export async function sendConfirmation(
  email: string,
  firstName: string,
  lang: 'he' | 'en'
): Promise<void> {
  const name = firstName
  const resend = new Resend(RESEND_API_KEY)
  const isRTL  = lang === 'he'

  const subject = isRTL
    ? 'נרשמת לוובינר: 7 ממדי ה-AI | Paretix Academy'
    : "You're registered: 7 AI Dimensions Webinar | Paretix Academy"

  const attachments: { filename: string; content: Buffer }[] = [
    { filename: 'webinar-invite.ics', content: Buffer.from(generateICS()) },
  ]
  const pdf = loadPDF()
  if (pdf) attachments.push({ filename: 'webinar-guide.pdf', content: pdf })

  await resend.emails.send({
    from:        EMAIL_FROM,
    to:          email,
    subject,
    html:        buildEmail(name, isRTL),
    attachments,
  })
}

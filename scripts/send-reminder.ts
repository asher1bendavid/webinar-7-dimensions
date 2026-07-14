/**
 * One-shot reminder blast — sends the Zoom link to every registrant.
 * Run from the project root: npx tsx scripts/send-reminder.ts
 */

import fs   from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { Resend }       from 'resend'

// ─── ENV ──────────────────────────────────────────────────────────────────────

const envFile = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([^#\s=][^=]*)=(.*)$/)
    if (m) {
      const key = m[1].trim()
      const val = m[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  }
}

const SUPABASE_URL      = process.env.SUPABASE_URL!
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY!
const RESEND_API_KEY    = process.env.RESEND_API_KEY!
const EMAIL_FROM        = 'Paretix Academy <registrations@academy.paretix.com>'
const ZOOM_LINK         = 'https://www.google.com/url?q=https://us02web.zoom.us/j/5525643286?pwd%3DiMGRZjDkdWCQe9ibpObIV1Pj2TVtPb.1%26omn%3D89430948042&amp;sa=D&amp;source=calendar&amp;ust=1782201682581188&amp;usg=AOvVaw0d43uOUYfxFN8LButdzXFP'
const FONT              = "'Heebo', 'Noto Sans Hebrew', 'Helvetica Neue', Arial, sans-serif"
const LOGO_URL          = 'https://paretix-ai-assessment.vercel.app/images/logo-light.png'
const COURSE_URL        = 'https://academy.paretix.com/'
const WEBINAR_URL       = 'https://7dimentionswebinar.paretix.com'

// ─── EMAIL TEMPLATE ───────────────────────────────────────────────────────────

function buildReminder(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>הוובינר מתחיל היום!</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800;900&display=swap');
    .headline { font-family: 'Heebo', 'Noto Sans Hebrew', Arial, sans-serif !important; font-weight: 900 !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f5f7;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding:0 0 20px 0;">
            <img src="${LOGO_URL}" alt="Paretix Academy" width="160" height="auto"
              style="display:block;border:0;height:auto;" />
          </td>
        </tr>

        <!-- TODAY badge -->
        <tr>
          <td align="center" style="padding:0 0 16px 0;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#c5a059;border-radius:999px;padding:6px 24px;">
                  <span style="font-family:${FONT};font-size:13px;font-weight:800;
                               color:#0a192f;letter-spacing:0.08em;">
                    ✦ &nbsp;הוובינר הוא היום&nbsp; ✦
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main card -->
        <tr>
          <td style="background:#0a192f;border-radius:16px;
                     border:1px solid rgba(197,160,89,0.2);
                     padding:36px 32px;" dir="rtl">

            <p style="margin:0 0 4px;font-family:${FONT};font-size:11px;font-weight:700;
                      letter-spacing:0.1em;text-transform:uppercase;color:#c5a059;">
              Paretix Academy
            </p>
            <h1 class="headline" style="margin:0 0 12px;
                       font-family:'Heebo','Noto Sans Hebrew',Arial,sans-serif;
                       font-size:26px;font-weight:900;color:#ffffff;
                       line-height:1.3;letter-spacing:-0.01em;
                       mso-line-height-rule:exactly;">
              ${firstName}, הוובינר מתחיל הערב!
            </h1>
            <p style="margin:0 0 24px;font-family:${FONT};font-size:15px;
                      color:#8892a4;line-height:1.7;">
              תזכורת אחרונה: <strong style="color:#ccd6f6;">7 ממדי ה-AI שכל אנליסט ומנהל חייב לשלוט בהם</strong>
              מתחיל בעוד שעות ספורות. הנה כל מה שצריך כדי להצטרף.
            </p>

            <!-- Time details -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="margin:0 0 28px;background:rgba(197,160,89,0.07);
                          border:1px solid rgba(197,160,89,0.25);border-radius:10px;">
              <tr>
                <td style="padding:16px 20px;" dir="rtl">
                  <p style="margin:0 0 8px;font-family:${FONT};font-size:14px;color:#ccd6f6;">
                    📅 &nbsp;יום חמישי, 18 יוני 2026
                  </p>
                  <p style="margin:0 0 8px;font-family:${FONT};font-size:14px;color:#ccd6f6;">
                    🕕 &nbsp;<strong style="color:#ffffff;">18:00 GMT+3</strong>
                    &nbsp;·&nbsp; משך: 60 דקות
                  </p>
                  <p style="margin:0;font-family:${FONT};font-size:14px;color:#ccd6f6;">
                    🌐 &nbsp;שידור חי בעברית
                  </p>
                </td>
              </tr>
            </table>

            <!-- Zoom button -->
            <p style="margin:0 0 14px;font-family:${FONT};font-size:15px;
                      font-weight:700;color:#ccd6f6;">
              קישור ההצטרפות ל-Zoom:
            </p>
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 0 0;">
              <tr>
                <td align="center" bgcolor="#c5a059" style="border-radius:10px;">
                  <a href="${ZOOM_LINK}"
                     style="display:inline-block;padding:15px 40px;color:#0a192f;
                            font-family:${FONT};font-size:16px;font-weight:900;
                            text-decoration:none;border-radius:10px;white-space:nowrap;">
                    🎥 &nbsp;הצטרף לוובינר ב-Zoom ←
                  </a>
                </td>
              </tr>
            </table>

            <!-- Plain link fallback -->
            <p style="margin:20px 0 0;font-family:${FONT};font-size:12px;
                      color:#6b7280;line-height:1.7;">
              אם הכפתור לא נפתח, הדבק את הקישור הבא בדפדפן שלך:
              <br/>
              <a href="${ZOOM_LINK}"
                 style="color:#c5a059;word-break:break-all;">לחץ כאן להצטרפות</a>
            </p>

            <!-- Contact -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="margin:28px 0 0;background:rgba(255,255,255,0.03);
                          border:1px solid rgba(197,160,89,0.15);border-radius:10px;">
              <tr>
                <td style="padding:16px 20px;" dir="rtl">
                  <p style="margin:0 0 6px;font-family:${FONT};font-size:13px;
                            font-weight:700;color:#ccd6f6;">
                    צריכים עזרה? אנחנו כאן בשבילכם:
                  </p>
                  <p style="margin:0 0 4px;font-family:${FONT};font-size:13px;color:#8892a4;">
                    📧 &nbsp;<a href="mailto:registrations@academy.paretix.com"
                               style="color:#c5a059;text-decoration:none;">
                      registrations@academy.paretix.com
                    </a>
                  </p>
                  <p style="margin:0;font-family:${FONT};font-size:13px;color:#8892a4;">
                    📞 &nbsp;ניצן: <a href="tel:+972549240034"
                                      style="color:#c5a059;text-decoration:none;">
                      054-924-0034
                    </a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:24px 0 0 0;">
            <p style="margin:0;font-family:${FONT};font-size:11px;
                      color:#9ca3af;line-height:1.8;" dir="rtl">
              © 2026 PARETIX Ltd. · רחוב יבנה 31, תל-אביב, ישראל<br/>
              <a href="${WEBINAR_URL}/privacy"
                 style="color:#9ca3af;text-decoration:underline;">מדיניות פרטיות</a>
              &nbsp;·&nbsp;
              <a href="${WEBINAR_URL}/terms"
                 style="color:#9ca3af;text-decoration:underline;">תנאי שימוש</a>
              &nbsp;·&nbsp;
              <a href="${COURSE_URL}"
                 style="color:#c5a059;text-decoration:none;">Paretix Academy</a>
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

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_API_KEY) {
    console.error('Missing env vars. Make sure .env.local is present with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.')
    process.exit(1)
  }

  const isTest   = process.argv.includes('--test')
  const testEmail = 'asher@embed.io'

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const resend   = new Resend(RESEND_API_KEY)

  const EXTRA_LIST = [
    { email: 'nathanbendavid23@gmail.com', name: 'נתן בן-דוד' },
    { email: 'adic@paretix.com',           name: 'Adi Cohen' },
    { email: 'adia@paretix.com',           name: 'Adi Hadar' },
    { email: 'alexd@paretix.com',          name: 'Alexander Dayan' },
    { email: 'alinb@paretix.com',          name: 'Alin Barami' },
    { email: 'annaa@paretix.com',          name: 'Anna Akilov' },
    { email: 'arielr@paretix.com',         name: 'Ariel Resnik' },
    { email: 'assafs@paretix.com',         name: 'אסף שובל' },
    { email: 'bars@paretix.com',           name: 'Bar Sade' },
    { email: 'elroik@paretix.com',         name: 'Elroi Kalfa' },
    { email: 'erany@paretix.com',          name: 'Eran Yaniv' },
    { email: 'guys@paretix.com',           name: 'Guy Singer' },
    { email: 'hadarik@paretix.com',        name: 'Hadari Kimchi' },
    { email: 'ishaib@paretix.com',         name: 'Ishai Barel' },
    { email: 'jornr@paretix.com',          name: 'Jorn Richter' },
    { email: 'maayang@paretix.com',        name: 'Maayan Gal' },
    { email: 'meravf@paretix.com',         name: 'Merav Friedland' },
    { email: 'moranm@paretix.com',         name: 'Moran Moshin' },
    { email: 'nitzanc@paretix.com',        name: 'ניצן כהן' },
    { email: 'orb@paretix.com',            name: 'Or B' },
    { email: 'orong@paretix.com',          name: 'Oron Gerassy' },
    { email: 'simonal@paretix.com',        name: 'Simona Levitsky' },
    { email: 'tamim@paretix.com',          name: 'Tami Mizrachi Maymon' },
    { email: 'yaels@paretix.com',          name: 'Yael Silon' },
    { email: 'yoavb@paretix.com',          name: 'Yoav Barzilay' },
    { email: 'yoval@paretix.com',          name: 'Yoval Harongi' },
    { email: 'adafia@gmail.com',           name: 'עדיה סמו' },
    { email: 'lizia@gottexmodels.com',     name: 'ליזי עמארה' },
    { email: 'tali.segal@milgam.co.il',    name: 'טלי סגל' },
    { email: 'amirch1bd@gmail.com',        name: 'אמיר ח' },
  ]

  const registrants = isTest
    ? [{ email: testEmail, name: 'אשר בן-דוד' }]
    : process.argv.includes('--list')
    ? EXTRA_LIST
    : await (async () => {
        const { data, error } = await supabase
          .from('webinar_registrations')
          .select('email, name')
        if (error) { console.error('Supabase error:', error.message); process.exit(1) }
        return data
      })()

  if (isTest) {
    console.log(`\nTEST MODE — sending to ${testEmail} only.\n`)
  } else {
    console.log(`\nSending to ${registrants.length} recipients.\n`)
  }

  const subject = 'הוובינר מתחיל היום בשעה 18:00 | 7 ממדי ה-AI | Paretix Academy'
  let sent = 0, failed = 0

  for (const reg of registrants) {
    const firstName = (reg.name as string).split(' ')[0]
    try {
      const { data: result, error: sendErr } = await resend.emails.send({
        from:    EMAIL_FROM,
        to:      reg.email as string,
        replyTo: 'registrations@academy.paretix.com',
        subject,
        html:    buildReminder(firstName),
      })
      if (sendErr) throw sendErr
      console.log(`  ✓  ${reg.email}  (id: ${result?.id})`)
      sent++
      // 200 ms gap — stays well within Resend's rate limits
      await new Promise(r => setTimeout(r, 200))
    } catch (err: any) {
      console.error(`  ✗  ${reg.email}  —  ${err?.message ?? err}`)
      failed++
    }
  }

  console.log(`\nDone: ${sent} sent, ${failed} failed.\n`)
}

main()

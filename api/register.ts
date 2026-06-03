import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { sendConfirmation } from '../lib/email'

// ─── VALIDATION ────────────────────────────────────────────────────────────────

const NAME_PATTERN = /^[a-zA-Zא-תװ-״\s\-'’]+$/

function getScript(text: string): 'latin' | 'hebrew' | 'mixed' | 'unknown' {
  const hasL = /[a-zA-Z]/.test(text)
  const hasH = /[א-״]/.test(text)
  if (hasL && hasH) return 'mixed'
  if (hasL) return 'latin'
  if (hasH) return 'hebrew'
  return 'unknown'
}

function validateName(name: string): string | null {
  if (!name.trim())             return 'Name is required'
  if (!NAME_PATTERN.test(name)) return 'Name contains invalid characters'
  if (getScript(name) === 'mixed') return 'Name cannot mix Latin and Hebrew characters'
  return null
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required'
  if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
    return 'Invalid email address'
  return null
}

const ALLOWED_ROLES = ['analyst','manager','ld','executive','other','']

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

// ─── HANDLER ────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { firstName, lastName, email, role, notifyEnglish, notifyOtherDates, lang } = req.body ?? {}

  // Required field presence
  if (!firstName?.trim()) return res.status(400).json({ error: 'First name is required' })
  if (!lastName?.trim())  return res.status(400).json({ error: 'Last name is required' })
  if (!email)             return res.status(400).json({ error: 'Email is required' })

  const trimmedFirst = (firstName as string).trim()
  const trimmedLast  = (lastName  as string).trim()
  const normalizedEmail = (email as string).trim().toLowerCase()
  const normalizedLang  = lang === 'he' ? 'he' : 'en'

  // Name validation
  const firstErr = validateName(trimmedFirst)
  if (firstErr) return res.status(400).json({ error: `First name: ${firstErr}` })

  const lastErr = validateName(trimmedLast)
  if (lastErr) return res.status(400).json({ error: `Last name: ${lastErr}` })

  // Cross-field script consistency
  const fs = getScript(trimmedFirst), ls = getScript(trimmedLast)
  if (fs !== ls && fs !== 'unknown' && ls !== 'unknown')
    return res.status(400).json({ error: 'First and last name must use the same language' })

  // Email validation
  const emailErr = validateEmail(normalizedEmail)
  if (emailErr) return res.status(400).json({ error: emailErr })

  // Role validation
  const trimmedRole = (role as string | undefined)?.trim() ?? ''
  if (!ALLOWED_ROLES.includes(trimmedRole))
    return res.status(400).json({ error: 'Invalid role value' })

  const fullName = `${trimmedFirst} ${trimmedLast}`

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: dbError } = await supabase
    .from('webinar_registrations')
    .upsert(
      {
        email:              normalizedEmail,
        name:               fullName,
        role:               trimmedRole || null,
        lang:               normalizedLang,
        notify_english:     notifyEnglish    ?? false,
        notify_other_dates: notifyOtherDates ?? false,
      },
      { onConflict: 'email' }
    )

  if (dbError) {
    console.error('DB error:', dbError)
    return res.status(500).json({ error: 'Database error' })
  }

  if (process.env.EMAIL_ENABLED !== 'false') {
    try {
      await sendConfirmation(normalizedEmail, trimmedFirst, normalizedLang)
    } catch (err) {
      console.error('Email error:', err)
      return res.status(500).json({ error: 'Email send failed' })
    }
  }

  return res.status(200).json({ success: true })
}

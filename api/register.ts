import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { sendConfirmation } from '../lib/email'

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, role, notifyEnglish, notifyOtherDates, lang } = req.body ?? {}

  if (!name?.trim())            return res.status(400).json({ error: 'Name is required' })
  if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Invalid email' })

  const normalizedEmail = (email as string).trim().toLowerCase()
  const normalizedLang  = lang === 'he' ? 'he' : 'en'
  const trimmedName     = (name as string).trim()

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: dbError } = await supabase
    .from('webinar_registrations')
    .upsert(
      {
        email:             normalizedEmail,
        name:              trimmedName,
        role:              (role as string | undefined)?.trim() || null,
        lang:              normalizedLang,
        notify_english:    notifyEnglish    ?? false,
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
      await sendConfirmation(normalizedEmail, trimmedName, normalizedLang)
    } catch (err) {
      console.error('Email error:', err)
      return res.status(500).json({ error: 'Email send failed' })
    }
  }

  return res.status(200).json({ success: true })
}

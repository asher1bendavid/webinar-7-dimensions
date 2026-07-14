/**
 * Lists academy leads who have not registered for the webinar.
 * Run from the project root: npx tsx scripts/compare.mts
 */

import fs   from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

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

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars. Make sure .env.local is present with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY)

const { data: leads }   = await db.from('leads').select('email, first_name, last_name')
const { data: webinar } = await db.from('webinar_registrations').select('email')

const webinarEmails = new Set(webinar!.map(r => r.email.toLowerCase()))
const missing = leads!.filter(l => !webinarEmails.has(l.email.toLowerCase()))

console.log(`Academy leads: ${leads!.length}`)
console.log(`Webinar registrants: ${webinar!.length}`)
console.log(`\nIn academy but NOT registered for webinar (${missing.length}):`)
for (const r of missing) console.log(`  ${r.email}  -  ${r.first_name} ${r.last_name}`)

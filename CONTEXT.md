# webinar-7-dimensions — Full Project Context

> Point Claude at this file at the start of any session. Everything below is derived from reading all source files as of 2026-06-05.

---

## 1. What This Project Is

A **webinar registration landing page** for Paretix Academy. The webinar is titled "7 AI Dimensions" and is scheduled for **June 18, 2026 at 18:00 GMT+3 (15:00 UTC)**. The page collects registrations, stores them in Supabase, and sends a bilingual confirmation email with an ICS calendar invite via Resend.

**Live domain:** https://7dimentionswebinar.paretix.com  
**Deployed on:** Vercel (auto-deploy from `master` branch)

---

## 2. File Structure

```
webinar-7-dimensions/
├── api/
│   └── register.ts          # Vercel serverless function — POST /api/register
├── lib/
│   └── email.ts             # Email builder + Resend sender
├── public/
│   └── logo.png             # Paretix Academy logo (also used in emails)
├── index.html               # Entire frontend (1100+ lines, all-in-one)
├── privacy.html             # Privacy policy
├── terms.html               # Terms of use
├── favicon.png / .ico / .svg
├── logo.png                 # OG tag logo
├── package.json
├── tsconfig.json
├── vercel.json
├── .env.example             # Template (no secrets)
└── .env.local               # Real secrets (gitignored)
```

---

## 3. Frontend

**Stack:** Pure HTML5 + Vanilla JavaScript. No framework, no bundler, no ES modules.

**Language:** Bilingual — Hebrew (RTL, default) and English (LTR). Client-side toggle via a `COPY` dictionary object in JS.

**Single page sections (top to bottom):**
1. Fixed navbar — logo, language toggle button, CTA anchor
2. Hero — headline, subtitle, countdown timer, CTAs
3. Stats bar — "Free | 60 min | Live Q&A"
4. Who is this for — 4-card audience grid
5. Benefits — 6-item checklist
6. Registration form — first name, last name, email, role dropdown, two notification checkboxes
7. About section — company description + links
8. Footer — copyright, privacy/terms links
9. Floating CTA — fixed bottom-right, appears via IntersectionObserver when hero/form scroll out of view

**Countdown timer:** Target = June 18, 2026 18:00 GMT+3. Always LTR regardless of language. Updates every 1 s.

**Calendar export:** "Add to Calendar" button opens `calendar.google.com/calendar/render?action=TEMPLATE&...` for June 18, 2026 15:00-16:00 UTC.

**Form submit flow:**
1. Frontend validates all fields (see Section 7).
2. `POST /api/register` with JSON body.
3. On `success: true` — hide form, show success state.
4. On error — display inline error message from server.

---

## 4. Backend

**Runtime:** Vercel Serverless Functions (`@vercel/node`), Node.js 18+.

**Single endpoint: `POST /api/register`**

Request body (JSON):
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required)",
  "role": "analyst|manager|ld|executive|other|'' (optional)",
  "notifyEnglish": "boolean (optional, default false)",
  "notifyOtherDates": "boolean (optional, default false)",
  "lang": "he|en"
}
```

Success response (`200`):
```json
{ "success": true }
```

Error responses (`400` or `500`):
```json
{ "error": "First name: Name is required" }
{ "error": "Invalid email address" }
{ "error": "First and last name must use the same language" }
{ "error": "Invalid role value" }
{ "error": "Database error" }
{ "error": "Email send failed" }
```

**Logic order inside the handler:**
1. Parse + validate request body (same rules as frontend).
2. Normalize email to lowercase + trim.
3. Upsert row to Supabase `webinar_registrations` (conflict key = `email`).
4. If `EMAIL_ENABLED=true` in env: call `sendConfirmation(email, firstName, lang)`.
5. Return `{ success: true }`.

No user auth — registrations are public/unauthenticated.

---

## 5. Database (Supabase)

**Project URL:** `https://vqykkgynuzlmnxoocbdq.supabase.co`

**Table: `webinar_registrations`**

| Column | Type | Nullable | Notes |
|---|---|---|---|
| id | uuid | NO | PK, auto |
| email | text | NO | Unique (upsert key) |
| name | text | NO | `firstName + " " + lastName` |
| role | text | YES | analyst / manager / ld / executive / other |
| lang | text | NO | `he` or `en` |
| notify_english | boolean | NO | Default false |
| notify_other_dates | boolean | NO | Default false |
| created_at | timestamp | NO | Auto on insert |
| updated_at | timestamp | NO | Auto on insert/update |

**Auth model:** Service Role Key used server-side only. Never exposed to browser. RLS not enforced (public write table via API only).

**Re-registration:** A second submit from the same email UPDATEs the existing row (upsert with `onConflict: 'email'`).

---

## 6. Email System (`lib/email.ts`)

**Service:** Resend  
**From:** `noreply@paretix.com`  
**Subject:** Bilingual — Hebrew or English based on `lang` param.

**Attachments on every confirmation email:**
1. `webinar-invite.ics` — generated inline via `generateICS()`, RFC 5545 compliant. Includes 2 alarms: 60 min before and 15 min before.
2. `webinar-guide.pdf` — optional; looked up at `public/webinar-guide.pdf`. If missing, email sends without it (no error).

**Email template (`buildEmail`):**
- Responsive HTML (mobile + Outlook safe)
- Navy (`#0a192f`) + Gold (`#c5a059`) colour scheme
- RTL layout for Hebrew, LTR for English
- Fonts: Heebo (Hebrew), Inter (English)
- Contains: header, main card, course promo banner, webinar banner, footer

**Exported function:**
```typescript
sendConfirmation(email: string, firstName: string, lang: 'he' | 'en'): Promise<void>
```

---

## 7. Validation Rules (Frontend + Backend — identical)

```
NAME_PATTERN = /^[a-zA-Zא-תװ-״\s\-'']+$/

Per name field:
  - Required (not empty after trim)
  - Only letters (Latin or Hebrew), spaces, hyphens, apostrophes
  - No mixed Latin+Hebrew in single field
  - firstName script must match lastName script

Email:
  - /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

Role (optional):
  - Must be one of: analyst, manager, ld, executive, other, ''
```

Error messages are bilingual — the server mirrors the frontend's Hebrew and English strings.

---

## 8. Environment Variables

File: `.env.local` (gitignored, set in Vercel dashboard for production)

```
SUPABASE_URL=https://vrerqegewlehbxxnagfn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role JWT>
RESEND_API_KEY=<resend key>
EMAIL_FROM=Paretix Academy <noreply@paretix.com>
EMAIL_ENABLED=true
```

Set `EMAIL_ENABLED=false` to skip email sending (useful for testing).

---

## 9. Deployment

**Platform:** Vercel

`vercel.json`:
```json
{
  "outputDirectory": ".",
  "rewrites": [
    { "source": "/privacy", "destination": "/privacy.html" },
    { "source": "/terms",   "destination": "/terms.html" }
  ]
}
```

- Static files served from repo root.
- API functions auto-compiled by `@vercel/node`.
- Custom domain: `7dimentionswebinar.paretix.com`.
- Auto-deploy on push to `master`.

---

## 10. Dependencies

```json
"dependencies": {
  "@supabase/supabase-js": "^2.106.2",
  "resend": "^6.12.4"
},
"devDependencies": {
  "@vercel/node": "^5.1.0",
  "@types/node": "^22.15.21",
  "typescript": "^5.8.3"
}
```

`npm run typecheck` runs `tsc --noEmit` — no build step needed for deployment.

---

## 11. Git State (as of 2026-06-05)

**Active branch:** `feat/form-validation`  
**Production branch:** `master`

Recent commits:
1. `61bf7d8` — split name into first+last, autocomplete attrs, field validation (frontend + backend)
2. `b4b4d2a` — correct square Paretix Academy favicon
3. `6207115` — favicon update
4. Earlier: initial commit, favicon iterations, vercel.json fix

The `feat/form-validation` branch adds first/last name splitting + dual-language validation. It has not been merged to `master` yet (as of this context snapshot).

---

## 12. Key Constants (hardcoded in source)

| Value | Location | Notes |
|---|---|---|
| Webinar date | `index.html` countdown timer + `lib/email.ts` ICS | June 18, 2026 18:00 GMT+3 = 15:00 UTC |
| Supabase URL | `.env.local` | `https://vqykkgynuzlmnxoocbdq.supabase.co` |
| Email sender | `.env.local` | `noreply@paretix.com` |
| Site URL | index.html | `https://7dimentionswebinar.paretix.com` |
| Academy URL | `lib/email.ts` | `https://academy.paretix.com` |
| ICS organizer | `lib/email.ts` | `noreply@paretix.com` |

---

## 13. Known Gaps / Things That Don't Exist Yet

- No README.md
- No admin dashboard or way to view registrations (use Supabase dashboard directly)
- No unsubscribe or delete endpoint
- `public/webinar-guide.pdf` — optional; email works without it
- No test suite
- No rate limiting on the registration endpoint
- No CAPTCHA / bot protection

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

interface OutreachPayload {
  hotelName: string
  contactEmail: string
  city: string
  country: string
  subject: string
  body: string
  sentDate?: string  // YYYY-MM-DD in the user's local timezone, sent from the browser
}

async function sendEmail(payload: OutreachPayload) {
  const nodemailer = (await import('nodemailer')).default

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'dannilangseth@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: '"Dannielle Langseth" <dannilangseth@gmail.com>',
    to: payload.contactEmail,
    subject: payload.subject,
    text: payload.body,
  })
}

async function appendToSheet(payload: OutreachPayload) {
  const { google } = await import('googleapis')

  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\\\n/g, '\\n').replace(/\\n/g, '\n')

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  // Prefer the date sent from the browser (user's local timezone).
  // Fall back to UTC only if missing, which avoids recording yesterday's date
  // for users in timezones ahead of UTC (e.g. Southeast Asia UTC+7).
  const todayStr = payload.sentDate ?? new Date().toISOString().split('T')[0]

  // J uses a row-position-independent formula so it always stays = I + 7
  // even if I is edited manually later. INDIRECT("I"&ROW()) resolves to the
  // correct cell regardless of which row this gets appended to.
  const jFormula = '=IF(INDIRECT("I"&ROW())="","",INDIRECT("I"&ROW())+7)'

  // Sheet layout — col A is always blank; data starts at B.
  // B: Country  C: City  D: Entity Name  E: Contact Name  F: Email Address
  // G: Interest Level  H: Response Notes  I: Last Contact Date
  // J: Next Follow-up Date (formula)  K: Verification Link
  const row = [
    payload.country,      // B — Country
    payload.city,         // C — City
    payload.hotelName,    // D — Entity Name
    '',                   // E — Contact Name
    payload.contactEmail, // F — Email Address
    '',                   // G — Interest Level
    '',                   // H — Response Notes
    todayStr,             // I — Last Contact Date
    jFormula,             // J — Next Follow-up Date (formula: I + 7)
    '',                   // K — Verification Link
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!B:K',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })
}

export async function POST(req: NextRequest) {
  try {
    const payload: OutreachPayload = await req.json()

    if (!payload.hotelName || !payload.contactEmail || !payload.subject || !payload.body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await Promise.all([sendEmail(payload), appendToSheet(payload)])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-outreach]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

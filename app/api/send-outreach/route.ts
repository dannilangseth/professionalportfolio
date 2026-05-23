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

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const followUp = new Date(today)
  followUp.setDate(followUp.getDate() + 7)
  const followUpStr = followUp.toISOString().split('T')[0]

  // Sheet layout — col A is always blank in this sheet; data starts at B.
  // Google Sheets append detects the table starting at B, so we write
  // directly to B:K (no leading blank for A).
  // B: Country  C: City  D: Entity Name  E: Contact Name  F: Email Address
  // G: Interest Level (dropdown: High/Medium/Low/Not Interested — blank on first send)
  // H: Response Notes  I: Last Contact Date  J: Next Follow-up Date  K: Verification Link
  // Note: the sheet has =I+7 formulas on J5:J124 but new appended rows fall
  // outside that range, so we write the +7 value directly.
  const row = [
    payload.country,      // B — Country
    payload.city,         // C — City
    payload.hotelName,    // D — Entity Name
    '',                   // E — Contact Name (unknown at send time)
    payload.contactEmail, // F — Email Address
    '',                   // G — Interest Level (blank until she gets a response)
    '',                   // H — Response Notes
    todayStr,             // I — Last Contact Date
    followUpStr,          // J — Next Follow-up Date (today + 7 days)
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

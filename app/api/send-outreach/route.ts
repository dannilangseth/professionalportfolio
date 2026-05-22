import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'

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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
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
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\\\n/g, '\\n').replace(/\\n/g, '\n')

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  const today = new Date().toISOString().split('T')[0]

  // Columns: Country, City, Entity Name, Contact Name, Email Address, Outreach Status, Last Contact Date, Next Follow-up Date
  const row = [
    payload.country,
    payload.city,
    payload.hotelName,
    '',
    payload.contactEmail,
    'Contacted',
    today,
    '',
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "'Client Lead & Outreach Tracker'!A:H",
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

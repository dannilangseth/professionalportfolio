import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// Sheet layout (data starts at col B, row 5):
// A(0) blank | B(1) Country | C(2) City | D(3) Entity Name | E(4) Contact Name
// F(5) Email | G(6) Interest Level | H(7) Response Notes
// I(8) Last Contact Date | J(9) Next Follow-up Date | K(10) Verification Link

export interface FollowUpContact {
  rowNum: number    // 1-indexed sheet row number (needed for updates)
  hotelName: string
  email: string
  city: string
  country: string
  lastContactDate: string
  daysSince: number
}

export async function GET() {
  try {
    const { google } = await import('googleapis')

    const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\\\n/g, '\\n').replace(/\\n/g, '\n')

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K',
    })

    const rows = response.data.values ?? []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const contacts: FollowUpContact[] = []

    rows.forEach((row, idx) => {
      const email = (row[5] ?? '').toString().trim()
      const interestLevel = (row[6] ?? '').toString().trim()
      const lastContactDate = (row[8] ?? '').toString().trim()

      // Must have an email, no interest level yet, and a valid last contact date
      if (!email || interestLevel !== '' || !lastContactDate) return

      const contactDate = new Date(lastContactDate + 'T00:00:00')
      if (isNaN(contactDate.getTime())) return

      const diffMs = today.getTime() - contactDate.getTime()
      const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      // Only include if 7 or more days have passed
      if (daysSince < 7) return

      contacts.push({
        rowNum: idx + 1,  // sheet rows are 1-indexed
        hotelName: (row[3] ?? '').toString().trim(),
        email,
        city: (row[2] ?? '').toString().trim(),
        country: (row[1] ?? '').toString().trim(),
        lastContactDate,
        daysSince,
      })
    })

    // Sort by most overdue first
    contacts.sort((a, b) => b.daysSince - a.daysSince)

    return NextResponse.json({ contacts })
  } catch (err) {
    console.error('[followup-contacts]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

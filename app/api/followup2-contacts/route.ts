import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// Sheet layout:
// A(0) blank | B(1) Country | C(2) City | D(3) Entity Name | E(4) Contact Name
// F(5) Email | G(6) Interest Level | H(7) Response Notes
// I(8) Last Contact Date | J(9) Next Follow-up Date | K(10) Verification Link
// L(11) Follow-up 1 Sent | M(12) Follow-up 2 Sent

export interface FollowUp2Contact {
  rowNum: number
  hotelName: string
  email: string
  city: string
  country: string
  nextFollowUpDate: string
  daysSince: number   // days since next follow-up date passed
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
      range: 'Sheet1!A:M',
    })

    const rows = response.data.values ?? []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const contacts: FollowUp2Contact[] = []

    rows.forEach((row, idx) => {
      const email          = (row[5]  ?? '').toString().trim()
      const interestLevel  = (row[6]  ?? '').toString().trim()
      const nextFollowUp   = (row[9]  ?? '').toString().trim()
      const followUp1Sent  = (row[11] ?? '').toString().trim()
      const followUp2Sent  = (row[12] ?? '').toString().trim()

      // Must have email, no interest level, FU1 sent, FU2 not sent, and a valid next follow-up date
      if (!email || interestLevel !== '' || !followUp1Sent || followUp2Sent !== '' || !nextFollowUp) return

      const followUpDate = new Date(nextFollowUp + 'T00:00:00')
      if (isNaN(followUpDate.getTime())) return

      const diffMs = today.getTime() - followUpDate.getTime()
      const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      // Only include if the next follow-up date has arrived (today or past)
      if (daysSince < 0) return

      contacts.push({
        rowNum: idx + 1,
        hotelName: (row[3] ?? '').toString().trim(),
        email,
        city: (row[2] ?? '').toString().trim(),
        country: (row[1] ?? '').toString().trim(),
        nextFollowUpDate: nextFollowUp,
        daysSince,
      })
    })

    contacts.sort((a, b) => b.daysSince - a.daysSince)

    return NextResponse.json({ contacts })
  } catch (err) {
    console.error('[followup2-contacts]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

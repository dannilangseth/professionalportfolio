import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// Sheet layout (col A is blank, data starts at B):
// A(0): blank  B(1): Country  C(2): City  D(3): Entity Name  E(4): Contact Name
// F(5): Email Address  G(6): Interest Level  H(7): Response Notes
// I(8): Last Contact Date  J(9): Next Follow-up Date  K(10): Verification Link
// Headers are in row 4; data rows start at row 5.
const COL_HOTEL = 3  // D — Entity Name
const COL_EMAIL = 5  // F — Email Address
const COL_DATE  = 8  // I — Last Contact Date

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

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
    const normalised = email.trim().toLowerCase()

    console.log('[check-email] total rows in sheet:', rows.length)
    console.log('[check-email] looking for:', normalised)
    console.log('[check-email] column F (email) values:', rows.map(r => r[COL_EMAIL] ?? '(empty)'))

    for (const row of rows) {
      const rowEmail = (row[COL_EMAIL] ?? '').toString().trim().toLowerCase()
      if (rowEmail === normalised) {
        return NextResponse.json({
          duplicate: true,
          hotel: (row[COL_HOTEL] ?? '').toString(),
          date:  (row[COL_DATE]  ?? '').toString(),
        })
      }
    }

    return NextResponse.json({ duplicate: false })
  } catch (err) {
    console.error('[check-email]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

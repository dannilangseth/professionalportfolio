import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// Columns: Country(A), City(B), Entity Name(C), Contact Name(D),
//          Email Address(E), Outreach Status(F), Last Contact Date(G), Next Follow-up Date(H)
const COL_HOTEL = 2  // C, index 2
const COL_EMAIL = 4  // E, index 4
const COL_DATE  = 6  // G, index 6

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
      range: 'Sheet1!A:H',
    })

    const rows = response.data.values ?? []
    const normalised = email.trim().toLowerCase()

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

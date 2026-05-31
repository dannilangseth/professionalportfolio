import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// For every row where column L (Follow-up 1 Sent) has a date,
// set column I (Last Contact Date) to that same date if it doesn't already match.

export async function POST() {
  try {
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

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:L',
    })
    const rows = response.data.values ?? []

    const updates: { range: string; values: string[][] }[] = []
    const changed: string[] = []

    rows.forEach((row, idx) => {
      // Skip header/title rows (data starts at row 5 = idx 4)
      if (idx < 4) return

      const followUp1Sent = (row[11] ?? '').toString().trim()  // col L
      const lastContact   = (row[8]  ?? '').toString().trim()  // col I

      // Only act on rows that have a date in Follow-up 1 Sent (not a header label)
      if (!followUp1Sent || !/^\d{4}-\d{2}-\d{2}$/.test(followUp1Sent)) return

      // Skip if already in sync
      if (lastContact === followUp1Sent) return

      const rowNum = idx + 1
      updates.push({ range: `Sheet1!I${rowNum}`, values: [[followUp1Sent]] })
      changed.push(`Row ${rowNum}: I was "${lastContact}" → "${followUp1Sent}"`)
    })

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      })
    }

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
      changes: changed,
    })
  } catch (err) {
    console.error('[sync-last-contact]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

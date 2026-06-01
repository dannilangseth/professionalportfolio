import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// For every row where column L (Follow-up 1 Sent) has a date:
//   - Set column I (Last Contact Date) to that date
//   - Set column J (Next Follow-up Date) to that date + 7 days
// Runs only where I or J are out of sync with L.

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
      const nextFollowUp  = (row[9]  ?? '').toString().trim()  // col J

      // Only act on rows that have a real date in Follow-up 1 Sent
      if (!followUp1Sent || !/^\d{4}-\d{2}-\d{2}$/.test(followUp1Sent)) return

      // Calculate what J should be: L + 7 days
      const sentDateObj = new Date(followUp1Sent + 'T00:00:00')
      sentDateObj.setDate(sentDateObj.getDate() + 7)
      const expectedNextFollowUp = sentDateObj.toISOString().split('T')[0]

      const iNeedsUpdate = lastContact !== followUp1Sent
      const jNeedsUpdate = nextFollowUp !== expectedNextFollowUp

      if (!iNeedsUpdate && !jNeedsUpdate) return

      const rowNum = idx + 1
      // Write I and J together in one range for efficiency
      updates.push({
        range: `Sheet1!I${rowNum}:J${rowNum}`,
        values: [[followUp1Sent, expectedNextFollowUp]],
      })
      changed.push(
        `Row ${rowNum}: I "${lastContact}"→"${followUp1Sent}", J "${nextFollowUp}"→"${expectedNextFollowUp}"`
      )
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

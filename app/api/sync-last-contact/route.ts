import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// For every row where column L or M has a sent date:
//   - Use the most recent sent date (M takes priority over L)
//   - Set column I (Last Contact Date) to that date
//   - Set column J (Next Follow-up Date) to that date + 7 days
// Only updates rows where I or J are out of sync.

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
      range: 'Sheet1!A:M',
    })
    const rows = response.data.values ?? []

    const updates: { range: string; values: string[][] }[] = []
    const changed: string[] = []
    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

    rows.forEach((row, idx) => {
      if (idx < 4) return  // skip header/title rows

      const followUp1Sent = (row[11] ?? '').toString().trim()  // col L
      const followUp2Sent = (row[12] ?? '').toString().trim()  // col M
      const lastContact   = (row[8]  ?? '').toString().trim()  // col I
      const nextFollowUp  = (row[9]  ?? '').toString().trim()  // col J

      // Use the most recent follow-up sent date — M takes priority over L
      const reference = DATE_RE.test(followUp2Sent)
        ? followUp2Sent
        : DATE_RE.test(followUp1Sent)
          ? followUp1Sent
          : null

      if (!reference) return  // no sent date on this row

      // Calculate what J should be: reference + 7 days
      if (lastContact === reference) return

      const rowNum = idx + 1
      updates.push({ range: `Sheet1!I${rowNum}`, values: [[reference]] })
      changed.push(`Row ${rowNum}: I "${lastContact}"→"${reference}"`)
      // J is a formula (=IF(I+7)) in the sheet — it updates automatically when I changes
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

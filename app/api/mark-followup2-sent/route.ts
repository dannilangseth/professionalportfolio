import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// Updates I (Last Contact) and M (Follow-up 2 Sent).
// J (Next Follow-up) is handled automatically by the =IF(I+7) formula in the sheet.
// Called by the client immediately after /api/send-followup2 succeeds.
export async function POST(req: NextRequest) {
  try {
    const { rowNum, sentDate } = await req.json()

    if (!rowNum || !sentDate) {
      return NextResponse.json({ error: 'Missing rowNum or sentDate' }, { status: 400 })
    }

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

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: `Sheet1!I${rowNum}`, values: [[sentDate]] },
          { range: `Sheet1!M${rowNum}`, values: [[sentDate]] },
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[mark-followup2-sent]', err)
    return NextResponse.json({ error: 'Sheet update failed' }, { status: 500 })
  }
}

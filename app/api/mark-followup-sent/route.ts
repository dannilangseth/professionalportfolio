import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// Updates columns I (Last Contact), J (Next Follow-up), and L (Follow-up 1 Sent)
// for a given row. Called by the client immediately after /api/send-followup succeeds.
export async function POST(req: NextRequest) {
  try {
    const { rowNum, sentDate } = await req.json()

    if (!rowNum || !sentDate) {
      return NextResponse.json({ error: 'Missing rowNum or sentDate' }, { status: 400 })
    }

    const followUp = new Date(sentDate + 'T00:00:00')
    followUp.setDate(followUp.getDate() + 7)
    const followUpStr = followUp.toISOString().split('T')[0]

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
          { range: `Sheet1!I${rowNum}:J${rowNum}`, values: [[sentDate, followUpStr]] },
          { range: `Sheet1!L${rowNum}`,             values: [[sentDate]] },
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[mark-followup-sent]', err)
    return NextResponse.json({ error: 'Sheet update failed' }, { status: 500 })
  }
}

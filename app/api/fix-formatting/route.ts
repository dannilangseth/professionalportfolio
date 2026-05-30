import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

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

    // ── Read current sheet to find banding ranges and sheetId ────────────────
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      includeGridData: false,
    })

    const sheet1 = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Sheet1')
    const sheetId = sheet1?.properties?.sheetId ?? 0
    const bandedRanges = sheet1?.bandedRanges ?? []

    // ── Build requests ───────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = []

    // 1. Delete all existing banding (may be fragmented from previous edits)
    for (const br of bandedRanges) {
      if (br.bandedRangeId != null) {
        requests.push({ deleteBanding: { bandedRangeId: br.bandedRangeId } })
      }
    }

    // 2. Harvest colours from the first existing banding so we preserve the
    //    blue/white scheme exactly — fall back to the standard Sheets cyan
    //    palette if nothing is found.
    const existing = bandedRanges[0]
    const rp = existing?.rowProperties

    const headerColor      = rp?.headerColor      ?? { red: 0.255, green: 0.502, blue: 0.882 }
    const firstBandColor   = rp?.firstBandColor   ?? { red: 1,     green: 1,     blue: 1     }
    const secondBandColor  = rp?.secondBandColor  ?? { red: 0.812, green: 0.886, blue: 1     }

    // 3. Add a single clean banding from row 1 to row 2000,
    //    columns A–L (indices 0–12) so column L is included.
    requests.push({
      addBanding: {
        bandedRange: {
          range: {
            sheetId,
            startRowIndex:    0,
            endRowIndex:      2000,
            startColumnIndex: 0,
            endColumnIndex:   12,   // A(0) … L(11) inclusive → end is exclusive 12
          },
          rowProperties: {
            headerColor,
            firstBandColor,
            secondBandColor,
          },
        },
      },
    })

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests },
    })

    return NextResponse.json({
      success: true,
      deletedBandingCount: bandedRanges.length,
      message: 'Banding reset — rows 1-2000, columns A-L.',
    })
  } catch (err) {
    console.error('[fix-formatting]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

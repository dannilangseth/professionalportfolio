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

    // ── Read current sheet ───────────────────────────────────────────────────
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      includeGridData: false,
    })

    const sheet1 = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Sheet1')
    const sheetId = sheet1?.properties?.sheetId ?? 0
    const bandedRanges = sheet1?.bandedRanges ?? []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = []

    if (bandedRanges.length > 0) {
      // ── Strategy: UPDATE the first (main) banding to cover the full range,
      //    then delete any extra fragments.
      //    Using updateBanding with fields:'range' leaves all colour/style
      //    settings completely untouched — only the range boundary changes.
      const [primary, ...extras] = bandedRanges

      requests.push({
        updateBanding: {
          bandedRange: {
            bandedRangeId: primary.bandedRangeId,
            range: {
              sheetId,
              startRowIndex:    0,
              endRowIndex:      2000,
              startColumnIndex: 0,
              endColumnIndex:   12,  // A–L inclusive (end is exclusive)
            },
          },
          fields: 'range',  // only change the range; preserve all colours exactly
        },
      })

      // Delete leftover fragment bands
      for (const br of extras) {
        if (br.bandedRangeId != null) {
          requests.push({ deleteBanding: { bandedRangeId: br.bandedRangeId } })
        }
      }
    } else {
      // No existing banding at all — add a fresh one with the standard blue/white
      requests.push({
        addBanding: {
          bandedRange: {
            range: {
              sheetId,
              startRowIndex:    0,
              endRowIndex:      2000,
              startColumnIndex: 0,
              endColumnIndex:   12,
            },
            rowProperties: {
              headerColorStyle:     { rgbColor: { red: 0.255, green: 0.502, blue: 0.882 } },
              firstBandColorStyle:  { rgbColor: { red: 1,     green: 1,     blue: 1     } },
              secondBandColorStyle: { rgbColor: { red: 0.812, green: 0.886, blue: 1     } },
            },
          },
        },
      })
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests },
    })

    return NextResponse.json({
      success: true,
      bandingFound: bandedRanges.length,
      message: bandedRanges.length > 0
        ? `Extended existing banding to rows 1-2000 cols A-L. Deleted ${bandedRanges.length - 1} extra fragment(s).`
        : 'No existing banding found — added fresh blue/white banding.',
    })
  } catch (err) {
    console.error('[fix-formatting]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

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

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      includeGridData: false,
    })

    const sheet1 = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Sheet1')
    const sheetId = sheet1?.properties?.sheetId ?? 0
    const bandedRanges = sheet1?.bandedRanges ?? []
    const frozenCols = sheet1?.properties?.gridProperties?.frozenColumnCount ?? 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = []

    // ── 1. Unfreeze columns (removes the thick divider line) ─────────────────
    if (frozenCols > 0) {
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: { frozenColumnCount: 0 },
          },
          fields: 'gridProperties.frozenColumnCount',
        },
      })
    }

    // ── 2. Fix banding ───────────────────────────────────────────────────────
    // Data header is row 4 (index 3). Starting the banding there means the
    // dark-blue header colour lands exactly on the header row, not on a blank row.
    const TARGET_RANGE = {
      sheetId,
      startRowIndex:    3,     // row 4 = header row
      endRowIndex:      2000,
      startColumnIndex: 0,     // col A
      endColumnIndex:   12,    // cols A–L inclusive
    }

    // Dark blue header + white / light-blue alternating bands
    const ROW_PROPS = {
      headerColorStyle:     { rgbColor: { red: 0.157, green: 0.306, blue: 0.608 } }, // dark blue
      firstBandColorStyle:  { rgbColor: { red: 1,     green: 1,     blue: 1     } }, // white
      secondBandColorStyle: { rgbColor: { red: 0.812, green: 0.886, blue: 1     } }, // light blue
    }

    if (bandedRanges.length > 0) {
      // Update the first banding; delete any extras
      const [primary, ...extras] = bandedRanges
      requests.push({
        updateBanding: {
          bandedRange: {
            bandedRangeId: primary.bandedRangeId,
            range: TARGET_RANGE,
            rowProperties: ROW_PROPS,
          },
          fields: 'range,rowProperties',
        },
      })
      for (const br of extras) {
        if (br.bandedRangeId != null) {
          requests.push({ deleteBanding: { bandedRangeId: br.bandedRangeId } })
        }
      }
    } else {
      requests.push({
        addBanding: {
          bandedRange: {
            range: TARGET_RANGE,
            rowProperties: ROW_PROPS,
          },
        },
      })
    }

    // ── 3. Clear any stray borders in the data range (A4:L2000) ─────────────
    const noBorder = { style: 'NONE' }
    requests.push({
      updateBorders: {
        range: {
          sheetId,
          startRowIndex:    3,
          endRowIndex:      2000,
          startColumnIndex: 0,
          endColumnIndex:   12,
        },
        top:    noBorder,
        bottom: noBorder,
        left:   noBorder,
        right:  noBorder,
        innerHorizontal: noBorder,
        innerVertical:   noBorder,
      },
    })

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests },
    })

    return NextResponse.json({
      success: true,
      unfrozeColumns: frozenCols,
      bandingUpdated: bandedRanges.length > 0 ? 'updated' : 'added',
      bordersCleared: true,
    })
  } catch (err) {
    console.error('[fix-formatting]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

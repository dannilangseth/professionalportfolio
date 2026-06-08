import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

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

    // ── Read sheet data + metadata in parallel ───────────────────────────────
    const [spreadsheet, dataResponse] = await Promise.all([
      sheets.spreadsheets.get({ spreadsheetId: SHEET_ID, includeGridData: false }),
      sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:M' }),
    ])

    const sheet1 = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Sheet1')
    const sheetId = sheet1?.properties?.sheetId ?? 0
    const bandedRanges = sheet1?.bandedRanges ?? []
    const frozenCols = sheet1?.properties?.gridProperties?.frozenColumnCount ?? 0

    // ════════════════════════════════════════════════════════════════════════
    // PART 1 — Fix sheet formatting
    // ════════════════════════════════════════════════════════════════════════
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatRequests: any[] = []

    // Unfreeze columns
    if (frozenCols > 0) {
      formatRequests.push({
        updateSheetProperties: {
          properties: { sheetId, gridProperties: { frozenColumnCount: 0 } },
          fields: 'gridProperties.frozenColumnCount',
        },
      })
    }

    // Banding: header on row 4, A–M inclusive
    const TARGET_RANGE = {
      sheetId,
      startRowIndex:    3,
      endRowIndex:      2000,
      startColumnIndex: 0,
      endColumnIndex:   13,  // A–M
    }
    const ROW_PROPS = {
      headerColorStyle:     { rgbColor: { red: 0.157, green: 0.306, blue: 0.608 } },
      firstBandColorStyle:  { rgbColor: { red: 1,     green: 1,     blue: 1     } },
      secondBandColorStyle: { rgbColor: { red: 0.957, green: 0.972, blue: 0.996 } },
    }

    if (bandedRanges.length > 0) {
      const [primary, ...extras] = bandedRanges
      formatRequests.push({
        updateBanding: {
          bandedRange: { bandedRangeId: primary.bandedRangeId, range: TARGET_RANGE, rowProperties: ROW_PROPS },
          fields: 'range,rowProperties',
        },
      })
      for (const br of extras) {
        if (br.bandedRangeId != null) {
          formatRequests.push({ deleteBanding: { bandedRangeId: br.bandedRangeId } })
        }
      }
    } else {
      formatRequests.push({ addBanding: { bandedRange: { range: TARGET_RANGE, rowProperties: ROW_PROPS } } })
    }

    // Clear stray borders in data range
    const noBorder = { style: 'NONE' }
    formatRequests.push({
      updateBorders: {
        range: { sheetId, startRowIndex: 3, endRowIndex: 2000, startColumnIndex: 0, endColumnIndex: 13 },
        top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
        innerHorizontal: noBorder, innerVertical: noBorder,
      },
    })

    // Explicitly format the entire header row (row 4) to white bold text
    // so new columns like M look identical to existing ones
    formatRequests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 13 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } } },
          },
        },
        fields: 'userEnteredFormat.textFormat',
      },
    })

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: formatRequests },
    })

    // Write M4 header value (values API, separate call)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!M4',
      valueInputOption: 'RAW',
      requestBody: { values: [['Follow-up 2 Sent']] },
    })

    // ════════════════════════════════════════════════════════════════════════
    // PART 2 — Sync I and J from most recent sent date (L or M)
    // ════════════════════════════════════════════════════════════════════════
    const rows = dataResponse.data.values ?? []
    const syncUpdates: { range: string; values: string[][] }[] = []
    const syncChanged: string[] = []

    rows.forEach((row, idx) => {
      if (idx < 4) return

      const followUp1Sent = (row[11] ?? '').toString().trim()
      const followUp2Sent = (row[12] ?? '').toString().trim()
      const lastContact   = (row[8]  ?? '').toString().trim()
      const nextFollowUp  = (row[9]  ?? '').toString().trim()

      const reference = DATE_RE.test(followUp2Sent)
        ? followUp2Sent
        : DATE_RE.test(followUp1Sent)
          ? followUp1Sent
          : null

      if (!reference) return

      const refDate = new Date(reference + 'T00:00:00')
      refDate.setDate(refDate.getDate() + 7)
      const expectedJ = refDate.toISOString().split('T')[0]

      if (lastContact === reference && nextFollowUp === expectedJ) return

      const rowNum = idx + 1
      syncUpdates.push({ range: `Sheet1!I${rowNum}:J${rowNum}`, values: [[reference, expectedJ]] })
      syncChanged.push(`Row ${rowNum}: I→"${reference}", J→"${expectedJ}"`)
    })

    if (syncUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { valueInputOption: 'USER_ENTERED', data: syncUpdates },
      })
    }

    return NextResponse.json({
      success: true,
      formatting: { unfrozeColumns: frozenCols, bandingUpdated: true, bordersCleared: true },
      sync: { updatedRows: syncUpdates.length, changes: syncChanged },
    })
  } catch (err) {
    console.error('[repair-all]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

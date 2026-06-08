import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

function buildFollowUpEmail(hotelName: string): { subject: string; body: string } {
  const subject = `Following up — ${hotelName} Photography Proposal`

  const body = `Hi there,

I wanted to follow up on my note from last week regarding a photography collaboration with ${hotelName}.

I work with properties on a professional engagement basis — meaning this is a structured photography partnership, not an influencer exchange. The details are always tailored to the property, and I am happy to walk through what that looks like on a call.

I photograph as a genuine guest, not a commercial crew. Guests behave naturally, staff move freely, and the result is imagery that feels aspirational and lived-in at the same time. That is what converts on social, on your website, and in paid advertising in a way that staged photography cannot replicate. Every image is hand-edited and color graded specifically to the atmosphere of your property. My work has been used by consumer brands across the U.S. for websites, seasonal campaigns, and paid media, including a content and licensing partnership with BUBBL'R Antioxidant Sparkling Water.

Here is where this work tends to make the biggest difference for properties:

1. New openings and renovations. If you have recently opened a new space, professional imagery is what makes that debut land with the impact it deserves.
2. Room and suite refreshes. Booking platforms and your own website depend on imagery that reflects the current state of your property. Outdated photos quietly cost bookings.
3. Social media continuity. Properties that perform consistently on social are drawing from a content library, not posting spontaneously. One collaboration can sustain weeks of high-quality, consistent posting.
4. Seasonal and campaign content. Fresh imagery tied to a promotion or menu change is what separates properties that market confidently from those that feel stale.
5. Destination storytelling. Travelers book an experience, not just a room. Photography that connects your property to the surrounding culture gives guests a reason to choose you over a competitor.

The scope is always built around what you actually need, and I would rather have a real conversation about your priorities than send a fixed package.

If you have five minutes this week, I would love to connect.

Portfolio and case studies: https://danniellelangseth.vercel.app

Warm regards,
Dannielle Langseth
dannilangseth@gmail.com`

  return { subject, body }
}

export async function POST(req: NextRequest) {
  try {
    const { hotelName, email, sentDate } = await req.json()

    if (!hotelName || !email) {
      return NextResponse.json({ error: 'Missing hotelName or email' }, { status: 400 })
    }

    const todayStr: string = sentDate ?? new Intl.DateTimeFormat('en-CA').format(new Date())
    // J is a formula in the sheet (=IF(I+7)) — we never write it for existing rows.
    // For new appended rows we write a position-independent formula instead of a value.
    const jFormula = '=IF(INDIRECT("I"&ROW())="","",INDIRECT("I"&ROW())+7)'

    const { subject, body } = buildFollowUpEmail(hotelName)

    // ── Initialise clients in parallel ───────────────────────────────────────
    const [nodemailerModule, { google }] = await Promise.all([
      import('nodemailer'),
      import('googleapis'),
    ])
    const nodemailer = nodemailerModule.default

    const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\\\n/g, '\\n').replace(/\\n/g, '\n')
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
      auth: {
        user: 'dannilangseth@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // ── Pre-warm auth token + send email in parallel ──────────────────────────
    const [, emailResult] = await Promise.allSettled([
      auth.getClient(),
      transporter.sendMail({
        from: '"Dannielle Langseth" <dannilangseth@gmail.com>',
        to: email,
        subject,
        text: body,
      }),
    ])

    if (emailResult.status === 'rejected') {
      console.error('[send-followup-manual] email failed', emailResult.reason)
      return NextResponse.json({ error: 'Email failed to send' }, { status: 500 })
    }

    // ── Find hotel in sheet (case-insensitive) ────────────────────────────────
    let sheetError = false
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A:L',
      })
      const rows = response.data.values ?? []
      const target = hotelName.toLowerCase().trim()

      let foundRowNum: number | null = null
      for (let i = 0; i < rows.length; i++) {
        const rowHotel = (rows[i][3] ?? '').toString().toLowerCase().trim()
        if (rowHotel === target) {
          foundRowNum = i + 1  // 1-indexed
          break
        }
      }

      if (foundRowNum !== null) {
        // Update existing row: Last Contact (I) and Follow-up 1 Sent (L).
        // J updates automatically via the =IF(I+7) formula already in the sheet.
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: [
              { range: `Sheet1!I${foundRowNum}`, values: [[todayStr]] },
              { range: `Sheet1!L${foundRowNum}`, values: [[todayStr]] },
            ],
          },
        })
        return NextResponse.json({ success: true, action: 'updated', rowNum: foundRowNum })
      } else {
        // Append new row — col A stays blank, data starts at B
        // B: Country  C: City  D: Hotel  E: Contact  F: Email
        // G: Interest  H: Notes  I: Last Contact  J: Next Follow-up  K: Link  L: FU1 Sent
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: 'Sheet1!B:L',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[
              '',          // B Country
              '',          // C City
              hotelName,   // D Entity Name
              '',          // E Contact Name
              email,       // F Email
              '',          // G Interest Level
              '',          // H Response Notes
              todayStr,  // I Last Contact Date
              jFormula,  // J Next Follow-up Date (formula: I + 7)
              '',        // K Verification Link
              todayStr,  // L Follow-up 1 Sent
            ]],
          },
        })
        return NextResponse.json({ success: true, action: 'appended' })
      }
    } catch (sheetErr) {
      console.error('[send-followup-manual] sheet update failed', sheetErr)
      sheetError = true
      return NextResponse.json({ success: true, sheetError: true })
    }
  } catch (err) {
    console.error('[send-followup-manual]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

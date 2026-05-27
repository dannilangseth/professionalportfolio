import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

function buildFollowUpEmail(hotelName: string): { subject: string; body: string } {
  const subject = `Following Up — ${hotelName} Photography Proposal`

  const body = `Hi there,

I wanted to follow up on my note about a potential photography collaboration with ${hotelName}.

To give you a clearer picture of what a partnership would look like:

What you'd receive:
  • 10–15 fully edited, high-resolution images
  • Non-exclusive license — yours to deploy across your website, social media, email campaigns, and print
  • Atmospheric, lifestyle-driven content specifically crafted to attract your ideal guest

As a luxury hospitality photographer, my work is built around one idea: making a property feel so desirable that someone books it on the spot. Not polished catalogue shots — real light, real atmosphere, the feeling of actually being there.

You can see this in practice at my portfolio: https://danniellelangseth.vercel.app

I'd love to find a time to talk through what this could look like for ${hotelName}'s upcoming season. Even a 15-minute call would be a great starting point.

Warmly,

Dannielle Langseth
dannilangseth@gmail.com`

  return { subject, body }
}

export async function POST(req: NextRequest) {
  try {
    const { rowNum, hotelName, email, sentDate } = await req.json()

    if (!rowNum || !hotelName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const todayStr: string = sentDate ?? new Date().toISOString().split('T')[0]
    const followUp = new Date(todayStr + 'T00:00:00')
    followUp.setDate(followUp.getDate() + 7)
    const followUpStr = followUp.toISOString().split('T')[0]

    const { subject, body } = buildFollowUpEmail(hotelName)

    // ── Send email ──────────────────────────────────────────────────────────
    const nodemailer = (await import('nodemailer')).default
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'dannilangseth@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: '"Dannielle Langseth" <dannilangseth@gmail.com>',
      to: email,
      subject,
      text: body,
    })

    // ── Update sheet row: stamp new Last Contact Date and Next Follow-up Date ─
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

    // Columns I and J hold Last Contact Date and Next Follow-up Date
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!I${rowNum}:J${rowNum}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[todayStr, followUpStr]] },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-followup]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

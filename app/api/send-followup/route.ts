import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

// This route sends the email only.
// The client calls /api/mark-followup-sent immediately after to update the sheet.
// Splitting into two calls gives each step the full Vercel 10s timeout.
export async function POST(req: NextRequest) {
  try {
    const { hotelName, email } = await req.json()

    if (!hotelName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { subject, body } = buildFollowUpEmail(hotelName)

    const nodemailer = (await import('nodemailer')).default

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

    await transporter.sendMail({
      from: '"Dannielle Langseth" <dannilangseth@gmail.com>',
      to: email,
      subject,
      text: body,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-followup]', err)
    return NextResponse.json({ error: 'Email failed to send' }, { status: 500 })
  }
}

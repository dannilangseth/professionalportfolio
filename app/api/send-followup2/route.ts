import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function buildFollowUp2Email(hotelName: string): { subject: string; body: string } {
  const subject = `One last note — ${hotelName}`

  const body = `Hi,

I have reached out twice now about a photography collaboration with ${hotelName}, and I want to be straightforward with you: I only follow up when I genuinely believe the fit is worth pursuing. Most properties I contact never hear from me a third time.

${hotelName} is one I keep coming back to.

Here is what I know about the hospitality market right now. Properties that are winning on direct bookings are not necessarily the ones with the biggest advertising budgets. They are the ones whose imagery makes someone stop scrolling and feel something — a specific longing to be there. That feeling is what drives a booking decision, and it cannot be manufactured with stock photos or a rushed commercial shoot.

What I do is different. I arrive as a genuine guest. I move through your property the way your ideal traveler would. I photograph the things your guests actually fall in love with — the quality of light at a specific hour, the atmosphere of a meal, the feeling of a space that has been thought through. The result is a library of images that performs across your website, your social channels, your paid campaigns, and your email marketing for months after the stay.

I work with a limited number of properties each season by design. The quality of the work requires it.

What I am offering ${hotelName} is a structured professional engagement — not a free stay for content. This is a partnership with clear deliverables, full commercial licensing, and imagery that is built to convert.

A few things worth knowing:

The properties that move forward with this tend to have one thing in common: they have someone on their team who understands that the visual content they use today shapes the revenue they earn six months from now.

Your competitors are already investing in this. The properties that appear effortlessly aspirational on Instagram and convert at a higher rate on their booking pages did not get there by accident. They made a deliberate decision to treat imagery as infrastructure, not an afterthought.

I have capacity for two more partnerships before the end of the season. If ${hotelName} is not the right fit, I completely understand — no response needed. But if there is any interest at all, even a small amount of curiosity, a five-minute call is genuinely all it takes to find out whether this makes sense.

Portfolio and previous work: https://danniellelangseth.vercel.app

Warmly,
Dannielle Langseth
dannilangseth@gmail.com`

  return { subject, body }
}

// Email-only route. Client calls /api/mark-followup2-sent immediately after.
export async function POST(req: NextRequest) {
  try {
    const { hotelName, email } = await req.json()

    if (!hotelName || !email) {
      return NextResponse.json({ error: 'Missing hotelName or email' }, { status: 400 })
    }

    const { subject, body } = buildFollowUp2Email(hotelName)
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
    console.error('[send-followup2]', err)
    return NextResponse.json({ error: 'Email failed to send' }, { status: 500 })
  }
}

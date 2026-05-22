'use client'

import { useState, useRef, FormEvent } from 'react'

async function geocodeCity(city: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    )
    const data = await res.json()
    return (data.results?.[0]?.country as string) ?? null
  } catch {
    return null
  }
}

function buildEmailBody(hotelName: string) {
  return `Hi there,

I came across ${hotelName} and honestly fell in love with the property — it's exactly the kind of place I love to shoot.

I'm a professional hospitality and travel photographer. My work has been used by consumer brands across the U.S. for their websites, social, and seasonal campaigns — and I'd love to bring that same quality to ${hotelName}.

I'd love to propose a stay at your property in exchange for a fully edited photo package, licensed for use across your website, social, and marketing emails.

Portfolio: https://danniellelangseth.vercel.app

Would love to discuss if it feels like a fit.

Dannielle Langseth
dannilangseth@gmail.com`
}

export default function OutreachPage() {
  const [hotelName, setHotelName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleHotelNameChange(val: string) {
    setHotelName(val)
    if (!subject || subject.startsWith(hotelName) || subject === '') {
      setSubject(val ? `${val} — Photography Proposal` : '')
    }
    if (!body || body.includes(hotelName) || body === '') {
      setBody(buildEmailBody(val))
    }
  }

  function handleCityChange(val: string) {
    setCity(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 2) return
    debounceRef.current = setTimeout(async () => {
      const detected = await geocodeCity(val)
      if (detected) setCountry(detected)
    }, 500)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/send-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelName, contactEmail, city, country, subject, body }),
      })

      if (!res.ok) throw new Error(await res.text())

      setStatus('success')
      setHotelName('')
      setContactEmail('')
      setCity('')
      setCountry('')
      setSubject('')
      setBody('')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <>
      <style>{`
        .outreach-wrap {
          max-width: 680px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.75rem;
        }
        .form-label {
          font-family: var(--label);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-3);
        }
        .form-input,
        .form-textarea {
          font-family: var(--sans);
          font-size: 15px;
          color: var(--ink);
          background: transparent;
          border: none;
          border-bottom: 0.5px solid var(--rule);
          padding: 0.5rem 0;
          outline: none;
          width: 100%;
          transition: border-color 200ms ease;
        }
        .form-input:focus,
        .form-textarea:focus {
          border-bottom-color: var(--ink);
        }
        .form-textarea {
          resize: vertical;
          min-height: 220px;
          line-height: 1.65;
          color: var(--text-2);
          font-size: 14px;
        }
        .submit-btn {
          font-family: var(--label);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--paper);
          background: var(--ink);
          border: none;
          padding: 0.85rem 2.25rem;
          cursor: pointer;
          transition: background 200ms ease;
          display: inline-block;
          margin-top: 0.5rem;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--ink-soft);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .success-banner {
          margin-top: 2rem;
          padding: 1.25rem 1.5rem;
          border: 0.5px solid rgba(42, 107, 148, 0.3);
          background: rgba(42, 107, 148, 0.04);
        }
        .success-banner p {
          font-family: var(--serif);
          font-style: italic;
          font-size: 18px;
          color: var(--accent);
          margin: 0;
        }
        .error-banner {
          margin-top: 1rem;
          font-family: var(--sans);
          font-size: 13px;
          color: #b85c38;
        }
        .row-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 600px) {
          .row-two { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>

      <div className="outreach-wrap">
        <div className="page-header">
          <p className="eyebrow">
            <span className="num">✦</span> Internal Tool
          </p>
          <h1 className="display">Hotel <em>Outreach</em></h1>
          <p className="lede" style={{ marginTop: '1.25rem' }}>
            Send a photography proposal and log the contact in one step.
          </p>
        </div>

        {status === 'success' && (
          <div className="success-banner">
            <p>Sent — email delivered and contact logged to the sheet.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '2.5rem' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="hotelName">Hotel / Resort Name</label>
            <input
              id="hotelName"
              className="form-input"
              type="text"
              value={hotelName}
              onChange={e => handleHotelNameChange(e.target.value)}
              placeholder="The Samui Resort"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="contactEmail">Contact Email</label>
            <input
              id="contactEmail"
              className="form-input"
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder="marketing@resort.com"
              required
            />
          </div>

          <div className="row-two">
            <div className="form-field">
              <label className="form-label" htmlFor="city">City</label>
              <input
                id="city"
                className="form-input"
                type="text"
                value={city}
                onChange={e => handleCityChange(e.target.value)}
                placeholder="Koh Samui"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="country">Country</label>
              <input
                id="country"
                className="form-input"
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="Auto-detected…"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="subject">Email Subject</label>
            <input
              id="subject"
              className="form-input"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="The Samui Resort — Photography Proposal"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="body">Email Body</label>
            <textarea
              id="body"
              className="form-textarea"
              value={body}
              onChange={e => setBody(e.target.value)}
              required
            />
          </div>

          {status === 'error' && (
            <p className="error-banner">{errorMsg || 'Failed to send — check console for details.'}</p>
          )}

          <button
            className="submit-btn"
            type="submit"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending…' : 'Send Outreach'}
          </button>
        </form>
      </div>
    </>
  )
}

'use client'

import { useState, FormEvent } from 'react'

const COUNTRIES = [
  'Thailand', 'Indonesia', 'Vietnam', 'Japan', 'Singapore', 'Malaysia',
  'Philippines', 'Sri Lanka', 'Maldives', 'India', 'Nepal', 'Australia',
  'New Zealand', 'France', 'Italy', 'Spain', 'Portugal', 'Greece',
  'Croatia', 'Turkey', 'Morocco', 'South Africa', 'Kenya', 'Tanzania',
  'Mexico', 'Costa Rica', 'Colombia', 'Brazil', 'Peru', 'United States',
  'Canada', 'United Kingdom', 'Germany', 'Switzerland', 'Austria',
  'Other',
]

function buildEmailBody(hotelName: string, city: string, country: string) {
  return `Hi there,

My name is Dannielle Langseth — I'm a hospitality and travel photographer based out of Southeast Asia, specializing in hotels, resorts, and lifestyle content.

I came across ${hotelName} and was really struck by the property. I'd love to explore whether there's an opportunity to collaborate — whether that's a content partnership, a press stay, or a commissioned shoot.

My portfolio: https://dannilangseth.com

I'd be happy to share more about my work and discuss what would be most valuable for your team.

Warm regards,
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

  function handleHotelNameChange(val: string) {
    setHotelName(val)
    if (!subject || subject.startsWith(hotelName) || subject === '') {
      setSubject(val ? `${val} — Photography Proposal` : '')
    }
    if (!body || body.includes(hotelName) || body === '') {
      setBody(buildEmailBody(val, city, country))
    }
  }

  function handleCityChange(val: string) {
    setCity(val)
    setBody(buildEmailBody(hotelName, val, country))
  }

  function handleCountryChange(val: string) {
    setCountry(val)
    setBody(buildEmailBody(hotelName, city, val))
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
        .form-select,
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
          appearance: none;
          -webkit-appearance: none;
        }
        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-bottom-color: var(--ink);
        }
        .form-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239b9489' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0 center;
          padding-right: 1.5rem;
          cursor: pointer;
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
              <select
                id="country"
                className="form-select"
                value={country}
                onChange={e => handleCountryChange(e.target.value)}
                required
              >
                <option value="" disabled>Select…</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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

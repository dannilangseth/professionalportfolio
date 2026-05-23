'use client'

import { useState, FormEvent } from 'react'

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

interface DuplicateWarning {
  hotel: string
  date: string
}

export default function OutreachPage() {
  const [hotelName, setHotelName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null)

  function handleHotelNameChange(val: string) {
    setHotelName(val)
    if (!subject || subject.startsWith(hotelName) || subject === '') {
      setSubject(val ? `${val} — Photography Proposal` : '')
    }
    if (!body || body.includes(hotelName) || body === '') {
      setBody(buildEmailBody(val))
    }
  }

  async function handleEmailBlur() {
    const email = contactEmail.trim()
    if (!email) return
    setDuplicateWarning(null)
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      console.log('[check-email] status:', res.status, 'response:', data)
      if (!res.ok) return
      if (data.duplicate) {
        setDuplicateWarning({ hotel: data.hotel, date: data.date })
      }
    } catch (err) {
      console.error('[check-email] fetch failed:', err)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/send-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelName, contactEmail, city: '', country: '', subject, body }),
      })

      if (!res.ok) throw new Error(await res.text())

      setStatus('success')
      setHotelName('')
      setContactEmail('')
      setSubject('')
      setBody('')
      setDuplicateWarning(null)
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
        .form-input--warn {
          border-bottom-color: #b85c38 !important;
        }
        .form-textarea {
          resize: vertical;
          min-height: 220px;
          line-height: 1.65;
          color: var(--text-2);
          font-size: 14px;
        }
        .duplicate-warn {
          font-family: var(--sans);
          font-size: 12.5px;
          color: #b85c38;
          margin-top: 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.4em;
        }
        .duplicate-warn::before {
          content: "⚠";
          font-size: 11px;
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
              className={`form-input${duplicateWarning ? ' form-input--warn' : ''}`}
              type="email"
              value={contactEmail}
              onChange={e => { setContactEmail(e.target.value); setDuplicateWarning(null) }}
              onBlur={handleEmailBlur}
              placeholder="marketing@resort.com"
              required
            />
            {duplicateWarning && (
              <span className="duplicate-warn">
                Already contacted — {duplicateWarning.hotel}{duplicateWarning.date ? ` on ${duplicateWarning.date}` : ''}
              </span>
            )}
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

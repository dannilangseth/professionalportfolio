'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'sending' | 'success' | 'error'
type ResultAction = 'updated' | 'appended'

export default function ManualFollowUpPage() {
  const [hotelName, setHotelName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [resultAction, setResultAction] = useState<ResultAction | null>(null)
  const [sheetError, setSheetError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    setResultAction(null)
    setSheetError(false)

    try {
      const res = await fetch('/api/send-followup-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName: hotelName.trim(),
          email: email.trim(),
          sentDate: new Intl.DateTimeFormat('en-CA').format(new Date()),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setStatus('success')
      setResultAction(data.action ?? null)
      setSheetError(!!data.sheetError)
      setHotelName('')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  function handleSendAnother() {
    setStatus('idle')
    setResultAction(null)
    setSheetError(false)
  }

  return (
    <>
      <style>{`
        .mfu-wrap { max-width: 620px; }

        .mfu-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4em;
          font-family: var(--label);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-3);
          text-decoration: none;
          margin-bottom: 2.5rem;
          transition: color 150ms ease;
        }
        .mfu-back:hover { color: var(--accent); }

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
        .form-input {
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
        .form-input:focus { border-bottom-color: var(--ink); }

        .submit-btn {
          font-family: var(--label);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--paper);
          background: var(--ink);
          border: none;
          padding: 0.9rem 2.5rem;
          cursor: pointer;
          transition: background 200ms ease;
          margin-top: 0.5rem;
          display: inline-block;
        }
        .submit-btn:hover:not(:disabled) { background: var(--ink-soft); }
        .submit-btn:disabled { opacity: 0.45; cursor: default; }

        .success-banner {
          margin-top: 0;
          padding: 1.5rem 1.75rem;
          border: 0.5px solid rgba(42, 107, 148, 0.3);
          background: rgba(42, 107, 148, 0.04);
        }
        .success-banner p {
          font-family: var(--serif);
          font-style: italic;
          font-size: 18px;
          color: var(--accent);
          margin: 0 0 0.25rem;
        }
        .success-banner .sheet-note {
          font-family: var(--sans);
          font-size: 12.5px;
          color: var(--text-3);
          margin: 0.5rem 0 0;
          font-style: normal;
        }
        .success-banner .sheet-warn {
          color: #b85c38;
        }
        .again-btn {
          font-family: var(--label);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          margin-top: 1.25rem;
          display: inline-block;
        }
        .again-btn:hover { color: var(--accent-deep); }

        .error-banner {
          margin-top: 1rem;
          font-family: var(--sans);
          font-size: 13px;
          color: #b85c38;
        }
      `}</style>

      <div className="mfu-wrap">
        <Link href="/outreach/followup" className="mfu-back">
          ← Back to batch follow-ups
        </Link>

        <div className="page-header">
          <p className="eyebrow"><span className="num">✦</span> Internal Tool</p>
          <h1 className="display">Manual <em>Follow-up</em></h1>
          <p className="lede" style={{ marginTop: '1.25rem' }}>
            Send follow-up 1 to a single resort. The sheet will be updated automatically — or a new row added if the property isn&apos;t found.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ marginTop: '2.5rem' }}>
            <div className="success-banner">
              <p>Follow-up sent.</p>
              {resultAction === 'updated' && !sheetError && (
                <p className="sheet-note">Sheet updated — Follow-up 1 Sent column marked.</p>
              )}
              {resultAction === 'appended' && !sheetError && (
                <p className="sheet-note">No existing row found — new entry added to the sheet.</p>
              )}
              {sheetError && (
                <p className="sheet-note sheet-warn">Email sent but sheet update failed — check Vercel logs.</p>
              )}
            </div>
            <button className="again-btn" onClick={handleSendAnother}>
              Send another →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '2.5rem' }}>
            <div className="form-field">
              <label className="form-label" htmlFor="hotelName">Resort / Hotel Name</label>
              <input
                id="hotelName"
                className="form-input"
                type="text"
                value={hotelName}
                onChange={e => setHotelName(e.target.value)}
                placeholder="The Samui Resort"
                required
                autoComplete="off"
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="email">Contact Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="marketing@resort.com"
                required
              />
            </div>

            {status === 'error' && (
              <p className="error-banner">{errorMsg}</p>
            )}

            <button
              className="submit-btn"
              type="submit"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send Follow-up'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}

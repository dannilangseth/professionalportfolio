'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Contact {
  rowNum: number
  hotelName: string
  email: string
  city: string
  country: string
  nextFollowUpDate: string
  daysSince: number
}

type SendStatus = 'idle' | 'sending' | 'sent' | 'error'

export default function FollowUp2Page() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [statuses, setStatuses] = useState<Record<number, SendStatus>>({})
  const [isSending, setIsSending] = useState(false)
  const [doneCount, setDoneCount] = useState(0)

  useEffect(() => {
    fetch('/api/followup2-contacts')
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        const list: Contact[] = data.contacts ?? []
        setContacts(list)
        setSelected(new Set(list.map(c => c.rowNum)))
      })
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function toggleAll() {
    if (selected.size === contacts.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(contacts.map(c => c.rowNum)))
    }
  }

  function toggle(rowNum: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(rowNum) ? next.delete(rowNum) : next.add(rowNum)
      return next
    })
  }

  async function handleSend() {
    const toSend = contacts.filter(c => selected.has(c.rowNum))
    if (!toSend.length) return

    setIsSending(true)
    setDoneCount(0)

    const init: Record<number, SendStatus> = {}
    toSend.forEach(c => { init[c.rowNum] = 'idle' })
    setStatuses(init)

    const sentDate = new Intl.DateTimeFormat('en-CA').format(new Date())

    let done = 0
    for (const contact of toSend) {
      setStatuses(prev => ({ ...prev, [contact.rowNum]: 'sending' }))

      try {
        // Step 1 — send email
        const emailRes = await fetch('/api/send-followup2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hotelName: contact.hotelName, email: contact.email }),
        })
        const emailData = await emailRes.json()

        if (!emailRes.ok || !emailData.success) {
          setStatuses(prev => ({ ...prev, [contact.rowNum]: 'error' }))
        } else {
          // Step 2 — update sheet
          try {
            await fetch('/api/mark-followup2-sent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rowNum: contact.rowNum, sentDate }),
            })
          } catch {
            console.error('[followup2] sheet update failed for row', contact.rowNum)
          }
          setStatuses(prev => ({ ...prev, [contact.rowNum]: 'sent' }))
        }
      } catch {
        setStatuses(prev => ({ ...prev, [contact.rowNum]: 'error' }))
      }

      done++
      setDoneCount(done)
      if (done < toSend.length) await new Promise(r => setTimeout(r, 300))
    }

    setIsSending(false)
  }

  const selectedCount = selected.size
  const sentCount = Object.values(statuses).filter(s => s === 'sent').length
  const errorCount = Object.values(statuses).filter(s => s === 'error').length
  const allDone = doneCount > 0 && !isSending

  return (
    <>
      <style>{`
        .fu-wrap { max-width: 740px; }

        .fu-summary {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 1rem 0;
          border-top: 0.5px solid var(--rule);
          border-bottom: 0.5px solid var(--rule);
          margin-bottom: 2rem;
          font-family: var(--label);
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-3);
        }
        .fu-summary strong { color: var(--ink); font-weight: 600; }

        .fu-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .fu-toggle {
          font-family: var(--label);
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--accent);
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .fu-toggle:hover { color: var(--accent-deep); }

        .fu-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          border-top: 0.5px solid var(--rule);
        }

        .fu-row {
          display: grid;
          grid-template-columns: 24px 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem 0;
          border-bottom: 0.5px solid var(--rule-soft);
          transition: background 120ms ease;
        }
        .fu-row:hover { background: rgba(0,0,0,0.012); }
        .fu-row--sent { opacity: 0.55; }

        .fu-check {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
          cursor: pointer;
          flex-shrink: 0;
        }

        .fu-info { min-width: 0; }
        .fu-hotel {
          font-family: var(--serif);
          font-size: 17px;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fu-meta {
          font-family: var(--sans);
          font-size: 12px;
          color: var(--text-3);
          margin-top: 2px;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .fu-overdue {
          color: #b85c38;
          font-weight: 500;
        }

        .fu-status {
          font-family: var(--label);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          white-space: nowrap;
          min-width: 70px;
          text-align: right;
        }
        .fu-status--idle    { color: var(--text-3); }
        .fu-status--sending { color: var(--accent); }
        .fu-status--sent    { color: #3a7d44; }
        .fu-status--error   { color: #b85c38; }

        .send-btn {
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
          margin-top: 2rem;
          display: inline-block;
        }
        .send-btn:hover:not(:disabled) { background: var(--ink-soft); }
        .send-btn:disabled { opacity: 0.45; cursor: default; }

        .done-banner {
          margin-top: 2rem;
          padding: 1.25rem 1.5rem;
          border: 0.5px solid rgba(42, 107, 148, 0.3);
          background: rgba(42, 107, 148, 0.04);
        }
        .done-banner p {
          font-family: var(--serif);
          font-style: italic;
          font-size: 18px;
          color: var(--accent);
          margin: 0;
        }
        .done-banner .err-note {
          font-family: var(--sans);
          font-size: 13px;
          color: #b85c38;
          margin-top: 0.5rem;
          font-style: normal;
        }

        .empty-state {
          padding: 3rem 0;
          font-family: var(--serif);
          font-style: italic;
          font-size: 20px;
          color: var(--text-2);
        }

        .progress-bar-wrap {
          height: 2px;
          background: var(--rule-soft);
          margin-bottom: 2rem;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: var(--accent);
          transition: width 300ms ease;
        }
      `}</style>

      <div className="fu-wrap">
        <div className="page-header">
          <p className="eyebrow"><span className="num">✦</span> Internal Tool</p>
          <h1 className="display">Follow-up 2 <em>Outreach</em></h1>
          <p className="lede" style={{ marginTop: '1.25rem' }}>
            Final outreach to contacts who received follow-up 1 but have not responded. Next follow-up date is today or overdue.
          </p>
          <Link
            href="/outreach/followup"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              fontFamily: 'var(--label)',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              textDecoration: 'none',
            }}
          >
            ← Back to follow-up 1
          </Link>
        </div>

        {loading && (
          <p className="body-copy" style={{ marginTop: '2rem', color: 'var(--text-3)' }}>
            Loading contacts…
          </p>
        )}

        {loadError && (
          <p style={{ color: '#b85c38', fontFamily: 'var(--sans)', fontSize: 13, marginTop: '2rem' }}>
            Failed to load contacts: {loadError}
          </p>
        )}

        {!loading && !loadError && contacts.length === 0 && (
          <div className="empty-state">
            No follow-up 2s due — check back when next follow-up dates arrive.
          </div>
        )}

        {!loading && !loadError && contacts.length > 0 && (
          <>
            <div className="fu-summary">
              <span><strong>{contacts.length}</strong> total due</span>
              <span><strong>{selectedCount}</strong> selected</span>
              {allDone && sentCount > 0 && (
                <span style={{ color: '#3a7d44' }}><strong>{sentCount}</strong> sent</span>
              )}
              {allDone && errorCount > 0 && (
                <span style={{ color: '#b85c38' }}><strong>{errorCount}</strong> failed</span>
              )}
            </div>

            {isSending && (
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar"
                  style={{ width: `${(doneCount / selectedCount) * 100}%` }}
                />
              </div>
            )}

            <div className="fu-controls">
              <button className="fu-toggle" onClick={toggleAll} disabled={isSending}>
                {selected.size === contacts.length ? 'Deselect all' : 'Select all'}
              </button>
              <span style={{
                fontFamily: 'var(--label)',
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--text-3)',
              }}>
                Hotel — Email — Days overdue
              </span>
            </div>

            <div className="fu-list">
              {contacts.map(c => {
                const status: SendStatus = statuses[c.rowNum] ?? 'idle'
                const isChecked = selected.has(c.rowNum)
                return (
                  <div
                    key={c.rowNum}
                    className={`fu-row${status === 'sent' ? ' fu-row--sent' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="fu-check"
                      checked={isChecked}
                      disabled={isSending || status === 'sent'}
                      onChange={() => toggle(c.rowNum)}
                    />
                    <div className="fu-info">
                      <div className="fu-hotel">{c.hotelName}</div>
                      <div className="fu-meta">
                        <span>{c.email}</span>
                        {(c.city || c.country) && (
                          <span>{[c.city, c.country].filter(Boolean).join(', ')}</span>
                        )}
                        <span className={c.daysSince > 7 ? 'fu-overdue' : ''}>
                          {c.daysSince === 0 ? 'due today' : `${c.daysSince}d overdue`}
                        </span>
                      </div>
                    </div>
                    <div className={`fu-status fu-status--${status}`}>
                      {status === 'idle'    && (isChecked ? '—' : 'skip')}
                      {status === 'sending' && 'Sending…'}
                      {status === 'sent'    && '✓ Sent'}
                      {status === 'error'   && '✗ Failed'}
                    </div>
                  </div>
                )
              })}
            </div>

            {!allDone && (
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={isSending || selectedCount === 0}
              >
                {isSending
                  ? `Sending ${doneCount} / ${selectedCount}…`
                  : `Send ${selectedCount} Final Follow-up${selectedCount !== 1 ? 's' : ''}`}
              </button>
            )}

            {allDone && (
              <div className="done-banner">
                <p>
                  {sentCount} final follow-up{sentCount !== 1 ? 's' : ''} sent — sheet updated.
                </p>
                {errorCount > 0 && (
                  <p className="err-note">
                    {errorCount} failed — check Vercel logs and retry those manually.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  const isPortfolioPage = ['/hospitality', '/food', '/lifestyle'].includes(pathname)

  useEffect(() => {
    if (!sidebarRef.current) return
    const links = sidebarRef.current.querySelectorAll('.navlist a, .bio, .wordmark, .side-foot')
    gsap.fromTo(links,
      { opacity: 0, x: -14 },
      {
        opacity: 1, x: 0,
        stagger: 0.06,
        duration: 0.7,
        ease: 'power2.out',
        delay: 0.2
      }
    )
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <aside
        className={`sidebar${open ? ' open' : ''}`}
        id="sidebar"
        ref={sidebarRef}
      >
        <Link href="/" className="wordmark" onClick={() => setOpen(false)}>
          Dannielle Langseth
          <em>Hospitality &amp; Travel Visuals</em>
        </Link>

        <div className="bio">
          <p>Visual storytelling for hotels, restaurants, and the brands shaping modern travel culture.</p>
        </div>

        <nav className="navlist" ref={linksRef}>
          <details className="nav-group" open={isPortfolioPage}>
            <summary>
              Portfolio <span className="chev">▾</span>
            </summary>
            <div className="nav-sub">
              <Link href="/hospitality" className={pathname === '/hospitality' ? 'active' : ''} onClick={() => setOpen(false)}>
                Hospitality &amp; Hotels
              </Link>
              <Link href="/food" className={pathname === '/food' ? 'active' : ''} onClick={() => setOpen(false)}>
                Food &amp; Beverage
              </Link>
              <Link href="/lifestyle" className={pathname === '/lifestyle' ? 'active' : ''} onClick={() => setOpen(false)}>
                Destinations &amp; Lifestyle
              </Link>
            </div>
          </details>
          <Link href="/#case-bubblr" onClick={() => setOpen(false)}>Case Study</Link>
          <Link href="/#about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/#contact" onClick={() => setOpen(false)}>Contact</Link>
        </nav>

        <div className="side-foot">
          <a href="mailto:dannilangseth@gmail.com" className="email">
            dannilangseth@gmail.com
          </a>
          <div className="legal">© 2026 — All rights reserved</div>
        </div>
      </aside>

      <button
        className="menu-btn"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/20"
          onClick={() => setOpen(false)}
          style={{ marginLeft: '300px' }}
        />
      )}
    </>
  )
}

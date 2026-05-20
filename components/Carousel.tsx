'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import gsap from 'gsap'
import Lightbox from './Lightbox'

const SLIDES = [
  { src: '/photos/IMG_4402.JPG', alt: 'Budapest archway at sunset over the Danube' },
  { src: '/photos/IMG_3338.JPG', alt: 'Boutique Greek resort with bougainvillea and lantana' },
  { src: '/photos/IMG_9042.JPG', alt: 'Aperol Spritz at the Colosseum, Rome' },
  { src: '/photos/IMG_0128.JPG', alt: 'Positano coastline with bougainvillea' },
  { src: '/photos/IMG_1137.JPG', alt: 'Sunset terrace at Mykonos beach restaurant' },
  { src: '/photos/IMG_9809.JPG', alt: 'Atrani cove on the Amalfi Coast' },
]

export default function Carousel() {
  const carRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  const updateThumb = useCallback(() => {
    const car = carRef.current
    const thumb = thumbRef.current
    if (!car || !thumb) return
    const max = car.scrollWidth - car.clientWidth
    if (max <= 0) { thumb.style.width = '100%'; thumb.style.left = '0'; return }
    const pct = car.scrollLeft / max
    const visible = car.clientWidth / car.scrollWidth
    thumb.style.width = (visible * 100) + '%'
    thumb.style.left = (pct * (100 - visible * 100)) + '%'
  }, [])

  useEffect(() => {
    const car = carRef.current
    if (!car) return
    car.addEventListener('scroll', updateThumb, { passive: true })
    window.addEventListener('resize', updateThumb)
    updateThumb()
    return () => {
      car.removeEventListener('scroll', updateThumb)
      window.removeEventListener('resize', updateThumb)
    }
  }, [updateThumb])

  useEffect(() => {
    const items = wrapperRef.current?.querySelectorAll('.c-item')
    if (!items) return
    gsap.fromTo(items,
      { opacity: 0, scale: 0.97 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        stagger: 0.12,
        ease: 'power2.out',
        delay: 0.1
      }
    )
  }, [])

  const step = useCallback((dir: number) => {
    const car = carRef.current
    if (!car) return
    const item = car.querySelector('.c-item') as HTMLElement
    if (!item) return
    const stepPx = item.getBoundingClientRect().width + 20
    car.scrollBy({ left: dir * stepPx, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightbox) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') { step(1); e.preventDefault() }
      if (e.key === 'ArrowLeft') { step(-1); e.preventDefault() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [step, lightbox])

  return (
    <>
      <section className="hero" ref={wrapperRef}>
        <div className="carousel" id="carousel" ref={carRef} tabIndex={0} aria-label="Selected work">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="c-item"
              onClick={() => setLightbox(slide)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.src} alt={slide.alt} loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
        <div className="c-rail">
          <div className="c-thumb" ref={thumbRef} />
        </div>
        <div className="c-hint">
          <span />
          <span className="nav-keys">
            <button onClick={() => step(-1)} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button onClick={() => step(1)} aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </span>
        </div>
      </section>

      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}

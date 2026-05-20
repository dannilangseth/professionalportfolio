'use client'

import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

interface LightboxProps {
  src: string
  alt: string
  onClose: () => void
}

export default function Lightbox({ src, alt, onClose }: LightboxProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.to(backdropRef.current, {
        backgroundColor: 'rgba(20,18,12,0.92)',
        backdropFilter: 'blur(8px)',
        duration: 0.4,
        ease: 'power2.out'
      })
      tl.to([imgRef.current, closeRef.current], {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.05
      }, '-=0.2')
    })
    return () => ctx.revert()
  }, [])

  const handleClose = useCallback(() => {
    const tl = gsap.timeline({ onComplete: onClose })
    tl.to([imgRef.current, closeRef.current], {
      opacity: 0,
      scale: 0.96,
      duration: 0.25,
      ease: 'power2.in',
      stagger: 0.03
    })
    tl.to(backdropRef.current, {
      backgroundColor: 'rgba(20,18,12,0)',
      backdropFilter: 'blur(0px)',
      duration: 0.25,
      ease: 'power2.in'
    }, '-=0.15')
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleClose])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-[4vh_4vw] cursor-zoom-out"
      style={{ backgroundColor: 'rgba(20,18,12,0)', backdropFilter: 'blur(0px)' }}
      onClick={(e) => { if (e.target === backdropRef.current) handleClose() }}
      role="dialog"
      aria-modal="true"
    >
      <button
        ref={closeRef}
        onClick={handleClose}
        aria-label="Close"
        style={{ opacity: 0, transform: 'scale(0.94)' }}
        className="absolute top-5 right-5 w-[42px] h-[42px] rounded-full bg-[var(--paper)] text-[var(--ink)] text-sm border-[0.5px] border-[var(--rule)] flex items-center justify-center z-10"
      >
        ✕
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{ opacity: 0, transform: 'scale(0.94)', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

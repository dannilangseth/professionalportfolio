'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lightbox from './Lightbox'

gsap.registerPlugin(ScrollTrigger)

interface Tile {
  src: string
  alt: string
  colSpan: string
  aspectRatio: string
  objectPosition?: string
  alignSelf?: string
  gridColumnStart?: string
}

interface RowGroup {
  label: string
  count: string
  tiles: Tile[]
}

interface GalleryProps {
  rows: RowGroup[]
}

export default function Gallery({ rows }: GalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    if (!galleryRef.current) return
    const tiles = galleryRef.current.querySelectorAll('.g-tile')
    const labels = galleryRef.current.querySelectorAll('.row-label')

    labels.forEach((label) => {
      gsap.fromTo(label,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: label,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      )
    })

    tiles.forEach((tile, i) => {
      gsap.fromTo(tile,
        { opacity: 0, y: 28, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: tile,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          delay: (i % 3) * 0.06
        }
      )
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <>
      <div className="gallery" ref={galleryRef}>
        {rows.map((row, ri) => (
          <>
            <div key={`label-${ri}`} className="row-label">
              <span>
                <span className="r-num" style={{ color: 'var(--accent)', marginRight: '0.5em' }}>
                  {row.label.split('.')[0]}.
                </span>
                {row.label.split('.').slice(1).join('.').trim()}
              </span>
              <span>{row.count}</span>
            </div>
            {row.tiles.map((tile, ti) => (
              <div
                key={`tile-${ri}-${ti}`}
                className="g-tile"
                style={{
                  gridColumn: tile.gridColumnStart
                    ? `${tile.gridColumnStart} / span ${tile.colSpan.replace('span ', '')}`
                    : tile.colSpan,
                  aspectRatio: tile.aspectRatio,
                  alignSelf: tile.alignSelf || 'auto'
                }}
                onClick={() => setLightbox({ src: tile.src, alt: tile.alt })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.src}
                  alt={tile.alt}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: tile.objectPosition || '50% 50%'
                  }}
                />
              </div>
            ))}
          </>
        ))}
      </div>

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

'use client'

import { useState } from 'react'
import Lightbox from './Lightbox'

const BUBBLR_TILES = [
  { src: '/photos/IMG_4334_crop.jpg', alt: 'BUBBL\'R social deliverable — pumpkin patch story' },
  { src: '/photos/IMG_1622.JPG', alt: 'BUBBL\'R lifestyle shot — Wisconsin Northwoods' },
  { src: '/photos/IMG_4333_crop.jpg', alt: 'BUBBL\'R social deliverable — lake-day story' },
]

export default function CaseStudyLightbox() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  return (
    <>
      <div className="case-grid--bubblr">
        {BUBBLR_TILES.map((tile, i) => (
          <figure
            key={i}
            className="bubblr-tile"
            onClick={() => setLightbox(tile)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tile.src} alt={tile.alt} loading="lazy" />
          </figure>
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

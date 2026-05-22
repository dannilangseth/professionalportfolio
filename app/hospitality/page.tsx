import type { Metadata } from 'next'
import Gallery from '@/components/Gallery'
import ScrollAnimations from '@/components/ScrollAnimations'

export const metadata: Metadata = {
  title: 'Hospitality & Hotels — Dannielle Langseth',
}

const rows = [
  {
    label: 'i. Mediterranean Properties',
    count: '03',
    tiles: [
      {
        src: '/photos/IMG_1137.JPG',
        alt: 'Sunset terrace at Mykonos beach restaurant',
        colSpan: 'span 12',
        aspectRatio: '3/2',
        objectPosition: '50% 40%',
      },
      {
        src: '/photos/IMG_3338.JPG',
        alt: 'Greek boutique resort at golden hour',
        colSpan: 'span 7',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_9865_2.JPG',
        alt: 'Villa Rufolo pergola with bougainvillea, Ravello',
        colSpan: 'span 5',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
    ],
  },
  {
    label: 'ii. Beach Clubs & Coast',
    count: '03',
    tiles: [
      {
        src: '/photos/IMG_9702.JPG',
        alt: 'Positano shoreline',
        colSpan: 'span 12',
        aspectRatio: '3/2',
        objectPosition: '50% 50%',
      },
      {
        src: '/photos/IMG_9663_2.JPG',
        alt: 'Da Ferdinando beach bar, Positano',
        colSpan: 'span 5',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_0456.JPG',
        alt: 'La Dolce Vita perched above the Positano beach club',
        colSpan: 'span 7',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
    ],
  },
  {
    label: 'iii. Terraces & Pergolas',
    count: '03',
    tiles: [
      {
        src: '/photos/IMG_0965_2.JPG',
        alt: 'Bamboo-shaded dining terrace, Ischia',
        colSpan: 'span 7',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_1060.JPG',
        alt: 'Mediterranean terrace',
        colSpan: 'span 5',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
      {
        src: '/photos/IMG_0747_2.JPG',
        alt: 'Pergola dining',
        colSpan: 'span 6',
        gridColumnStart: '4',
        aspectRatio: '3/4',
      },
    ],
  },
  {
    label: 'iv. Interiors & Atmosphere',
    count: '03',
    tiles: [
      {
        src: '/photos/IMG_9623_2.JPG',
        alt: 'Bohemian restaurant interior, Positano',
        colSpan: 'span 7',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_9672.JPG',
        alt: 'Chez Black bistro interior, Positano',
        colSpan: 'span 5',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
      {
        src: '/photos/IMG_0139.JPG',
        alt: 'Hotel interior detail',
        colSpan: 'span 12',
        aspectRatio: '3/2',
        objectPosition: '50% 50%',
      },
    ],
  },
  {
    label: 'v. Cycladic & Whitewashed Architecture',
    count: '03',
    tiles: [
      {
        src: '/photos/IMG_0840.JPG',
        alt: 'Mykonos windmills at dusk',
        colSpan: 'span 12',
        aspectRatio: '14/9',
      },
      {
        src: '/photos/IMG_2155.JPG',
        alt: 'Bougainvillea-covered whitewashed villa, Cadaqués',
        colSpan: 'span 7',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_1146.JPG',
        alt: 'Whitewashed villa detail',
        colSpan: 'span 5',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
    ],
  },
]

export default function HospitalityPage() {
  return (
    <>
      <ScrollAnimations />
      <header className="page-header">
        <div className="eyebrow"><span className="num">i.</span>Portfolio</div>
        <h1 className="display">Hospitality<br />&amp; <em>Hotels</em></h1>
        <p className="lede">
          Property work for boutique resorts, beach clubs, and the kind of Mediterranean addresses that sell on atmosphere, not amenities.
        </p>
        <div className="meta">
          <span>Italy · Greece · Spain · France</span>
          <span>Property · Editorial · Brand</span>
        </div>
      </header>
      <Gallery rows={rows} />
    </>
  )
}

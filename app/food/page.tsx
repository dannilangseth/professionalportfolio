import type { Metadata } from 'next'
import Gallery from '@/components/Gallery'
import ScrollAnimations from '@/components/ScrollAnimations'

export const metadata: Metadata = {
  title: 'Food & Beverage — Dannielle Langseth',
}

const rows = [
  {
    label: 'i. The Table',
    count: '04',
    tiles: [
      {
        src: '/photos/IMG_7790.JPG',
        alt: 'Catalan market stall with seasonal stone fruits, Barcelona',
        colSpan: 'span 12',
        aspectRatio: '3/2',
        objectPosition: '50% 50%',
      },
      {
        src: '/photos/IMG_0124.JPG',
        alt: 'Spaghetti vongole on hand-painted ceramic, Praiano',
        colSpan: 'span 7',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_0358.JPG',
        alt: 'Market fruit and berries',
        colSpan: 'span 5',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
      {
        src: '/photos/IMG_2693_VSCO4.JPG',
        alt: 'Bruschetta on wooden board, Mykonos',
        colSpan: 'span 8',
        gridColumnStart: '3',
        aspectRatio: '3/4',
      },
    ],
  },
  {
    label: 'ii. Pâtisserie & Sweets',
    count: '02',
    tiles: [
      {
        src: '/photos/IMG_8623.JPG',
        alt: 'Pistachio sfogliatelle in pastry case',
        colSpan: 'span 5',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_2479.JPG',
        alt: 'Berry mousse cake',
        colSpan: 'span 7',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
    ],
  },
  {
    label: 'iii. Aperitivo',
    count: '01',
    tiles: [
      {
        src: '/photos/IMG_9042.JPG',
        alt: 'Aperol Spritz held against the Colosseum, Rome',
        colSpan: 'span 8',
        gridColumnStart: '3',
        aspectRatio: '3/4',
      },
    ],
  },
]

export default function FoodPage() {
  return (
    <>
      <ScrollAnimations />
      <header className="page-header">
        <div className="eyebrow"><span className="num">ii.</span>Portfolio</div>
        <h1 className="display">Food &amp;<br /><em>Beverage</em></h1>
        <p className="lede">
          A table on the coast, an aperitivo at the Colosseum, a pastry case at the right hour. The work restaurants and beverage brands use to make a guest book the seat.
        </p>
        <div className="meta">
          <span>Restaurants · Aperitivo · Pâtisserie · Markets</span>
        </div>
      </header>
      <Gallery rows={rows} />
    </>
  )
}

import type { Metadata } from 'next'
import Gallery from '@/components/Gallery'
import ScrollAnimations from '@/components/ScrollAnimations'

export const metadata: Metadata = {
  title: 'Destinations & Lifestyle — Dannielle Langseth',
}

const rows = [
  {
    label: 'i. Italian Coast',
    count: '05',
    tiles: [
      {
        src: '/photos/IMG_0128.JPG',
        alt: 'Positano coastline',
        colSpan: 'span 12',
        aspectRatio: '3/2',
        objectPosition: '50% 50%',
      },
      {
        src: '/photos/IMG_1105_2.JPG',
        alt: 'Yellow Fiat 500 on Procida lane',
        colSpan: 'span 7',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_1088_2.JPG',
        alt: 'Procida bookseller in his doorway',
        colSpan: 'span 5',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
      {
        src: '/photos/IMG_9652_3.JPG',
        alt: 'La Dolce Vita ceramic wall, Positano',
        colSpan: 'span 5',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_0931_2.JPG',
        alt: 'Ischia laundry on a yellow facade',
        colSpan: 'span 7',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
    ],
  },
  {
    label: 'ii. Cities & Heritage',
    count: '05',
    tiles: [
      {
        src: '/photos/IMG_4402.JPG',
        alt: 'Budapest archway at sunset over the Danube',
        colSpan: 'span 12',
        aspectRatio: '3/2',
        objectPosition: '50% 50%',
      },
      {
        src: '/photos/IMG_0790.JPG',
        alt: 'Hungarian Parliament with guards, Budapest',
        colSpan: 'span 5',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_9476_2.JPG',
        alt: 'Santa Chiara cloister, Naples',
        colSpan: 'span 7',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
      {
        src: '/photos/IMG_9062.JPG',
        alt: 'Nun at a Marian shrine, Rome',
        colSpan: 'span 5',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_7788.JPG',
        alt: 'Gondola on a Venice canal',
        colSpan: 'span 7',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
    ],
  },
  {
    label: 'iii. Venice & Burano',
    count: '02',
    tiles: [
      {
        src: '/photos/IMG_7785.JPG',
        alt: 'Burano coloured houses reflected in canal water',
        colSpan: 'span 12',
        aspectRatio: '3/2',
        objectPosition: '50% 50%',
      },
      {
        src: '/photos/IMG_7786.JPG',
        alt: 'Burano fisherman\'s house facade in vivid colour',
        colSpan: 'span 6',
        gridColumnStart: '4',
        aspectRatio: '3/4',
      },
    ],
  },
  {
    label: 'iv. Greek Isles',
    count: '06',
    tiles: [
      {
        src: '/photos/IMG_3590_2.JPG',
        alt: 'White villa with magenta bougainvillea archway',
        colSpan: 'span 7',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_1540.JPG',
        alt: 'Mykonos blue-shuttered alley',
        colSpan: 'span 5',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
      {
        src: '/photos/IMG_7778.JPG',
        alt: 'Mykonos whitewashed window with blue shutter',
        colSpan: 'span 5',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_7777.JPG',
        alt: 'Mykonos cobbled lane and blue door',
        colSpan: 'span 7',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
      {
        src: '/photos/IMG_1623.JPG',
        alt: 'Mykonos cats at rest',
        colSpan: 'span 5',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_0255_3.JPG',
        alt: 'Aegean coastline',
        colSpan: 'span 7',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
    ],
  },
  {
    label: 'v. Atmosphere & Air',
    count: '04',
    tiles: [
      {
        src: '/photos/IMG_1173.JPG',
        alt: 'White linens drying on Ischia rooftop at sunset',
        colSpan: 'span 12',
        aspectRatio: '3/2',
        objectPosition: '50% 50%',
      },
      {
        src: '/photos/IMG_9074.JPG',
        alt: 'Seljalandsfoss waterfall, Iceland',
        colSpan: 'span 5',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_7783.JPG',
        alt: 'Iceland waterfall through volcanic rock arch',
        colSpan: 'span 4',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_8344_2.jpg',
        alt: 'Airplane window at sunset',
        colSpan: 'span 3',
        aspectRatio: '3/4',
        alignSelf: 'end',
      },
    ],
  },
  {
    label: 'vi. Quieter Frames',
    count: '04',
    tiles: [
      {
        src: '/photos/IMG_0161.JPG',
        alt: 'Travel detail',
        colSpan: 'span 3',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_7784.JPG',
        alt: 'Street art mural on a European wall',
        colSpan: 'span 3',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_0582_2.JPG',
        alt: 'Coastal scene',
        colSpan: 'span 3',
        aspectRatio: '3/4',
      },
      {
        src: '/photos/IMG_0899_2.JPG',
        alt: 'European street',
        colSpan: 'span 3',
        aspectRatio: '3/4',
      },
    ],
  },
]

export default function LifestylePage() {
  return (
    <>
      <ScrollAnimations />
      <header className="page-header">
        <div className="eyebrow"><span className="num">iii.</span>Portfolio</div>
        <h1 className="display">Destinations<br />&amp; <em>Lifestyle</em></h1>
        <p className="lede">
          Cities, character, architecture, and the quiet moments that give a place its identity. Editorial-feeling imagery for tourism partners, travel publications, and lifestyle brands.
        </p>
        <div className="meta">
          <span>Italy · Venice · Burano · Greece · France · Spain · Hungary · Iceland</span>
        </div>
      </header>
      <Gallery rows={rows} />
    </>
  )
}

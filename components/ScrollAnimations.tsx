'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Eyebrow labels
      gsap.utils.toArray<HTMLElement>('.eyebrow').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, x: -12 },
          {
            opacity: 1, x: 0,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%' }
          }
        )
      })

      // Display headings — stagger lines
      gsap.utils.toArray<HTMLElement>('.display').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 36, skewY: 0.6 },
          {
            opacity: 1, y: 0, skewY: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' }
          }
        )
      })

      // Lede paragraphs
      gsap.utils.toArray<HTMLElement>('.lede').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' }
          }
        )
      })

      // Body copy paragraphs
      gsap.utils.toArray<HTMLElement>('.body-copy').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 18 },
          {
            opacity: 1, y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' }
          }
        )
      })

      // Case meta items — stagger across
      const metaItems = gsap.utils.toArray<HTMLElement>('.case-meta > div')
      if (metaItems.length) {
        gsap.fromTo(metaItems,
          { opacity: 0, y: 22 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: metaItems[0], start: 'top 88%' }
          }
        )
      }

      // BUBBL'R tiles — stagger reveal with clip
      const bubblrTiles = gsap.utils.toArray<HTMLElement>('.bubblr-tile')
      if (bubblrTiles.length) {
        gsap.fromTo(bubblrTiles,
          { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
          {
            clipPath: 'inset(0 0 0% 0)',
            opacity: 1,
            duration: 1.0,
            stagger: 0.14,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: bubblrTiles[0], start: 'top 82%' }
          }
        )
      }

      // Feature images — parallax inner image
      gsap.utils.toArray<HTMLElement>('.f-img').forEach((container) => {
        const img = container.querySelector('img')
        if (!img) return
        gsap.fromTo(container,
          { clipPath: 'inset(0 0 18% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.0,
            ease: 'power2.out',
            scrollTrigger: { trigger: container, start: 'top 82%' }
          }
        )
        gsap.fromTo(img,
          { scale: 1.12 },
          {
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: { trigger: container, start: 'top 82%' }
          }
        )
      })

      // Brand strip image
      gsap.utils.toArray<HTMLElement>('.b-img').forEach((container) => {
        const img = container.querySelector('img')
        if (!img) return
        gsap.fromTo(container,
          { clipPath: 'inset(0 0 18% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.0,
            ease: 'power2.out',
            scrollTrigger: { trigger: container, start: 'top 82%' }
          }
        )
        gsap.fromTo(img,
          { scale: 1.1 },
          {
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: { trigger: container, start: 'top 82%' }
          }
        )
      })

      // Portfolio index cards — staggered reveal
      const piCards = gsap.utils.toArray<HTMLElement>('.pi-card')
      if (piCards.length) {
        gsap.fromTo(piCards,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: piCards[0], start: 'top 84%' }
          }
        )
      }

      // About image
      const aboutImg = document.querySelector('.about-img') as HTMLElement
      if (aboutImg) {
        const img = aboutImg.querySelector('img')
        gsap.fromTo(aboutImg,
          { clipPath: 'inset(0 0 20% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: aboutImg, start: 'top 82%' }
          }
        )
        if (img) {
          gsap.fromTo(img,
            { scale: 1.14 },
            {
              scale: 1,
              duration: 1.3,
              ease: 'power2.out',
              scrollTrigger: { trigger: aboutImg, start: 'top 82%' }
            }
          )
        }
      }

      // About list items
      const listItems = gsap.utils.toArray<HTMLElement>('.about-list > div')
      if (listItems.length) {
        gsap.fromTo(listItems,
          { opacity: 0, y: 16 },
          {
            opacity: 1, y: 0,
            duration: 0.5,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: { trigger: listItems[0], start: 'top 88%' }
          }
        )
      }

      // Contact email
      const contactEmail = document.querySelector('.contact-email') as HTMLElement
      if (contactEmail) {
        gsap.fromTo(contactEmail,
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: contactEmail, start: 'top 88%' }
          }
        )
      }

      // Section borders — animate in from left
      gsap.utils.toArray<HTMLElement>('section.block').forEach((section) => {
        gsap.fromTo(section,
          { borderBottomColor: 'transparent' },
          {
            borderBottomColor: 'var(--rule)',
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 80%' }
          }
        )
      })

      // Rule line horizontal reveal on page header
      const pageHeader = document.querySelector('.page-header') as HTMLElement
      if (pageHeader) {
        gsap.fromTo(pageHeader,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: 0.1
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

  return null
}
